const MarketPrice = require("../models/MarketPrice");

/**
 * Service to synchronize real Government of India Mandi Market Price data
 * from the Open Government Data (OGD) Platform (data.gov.in / AGMARKNET).
 * 
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 * Dataset: Current Daily Price of Various Commodities from Various Markets (Mandi)
 * Associated: Ministry of Agriculture and Farmers Welfare, DMI, AGMARKNET
 */

const OGD_BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

/**
 * Parses arrival date string (e.g. "01/10/2026" or "2026-10-01") into a valid Date object.
 */
function parseArrivalDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  
  // DD/MM/YYYY format
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day));
      if (!isNaN(d.getTime())) return d;
    }
  }
  
  // ISO or standard date string
  const d = new Date(trimmed);
  return !isNaN(d.getTime()) ? d : null;
}

/**
 * Normalizes an raw official OGD AGMARKNET record into the HumanLink MarketPrice structure.
 */
function normalizeRecord(raw, syncTimestamp) {
  const state = raw.state ? String(raw.state).trim() : "";
  const district = raw.district ? String(raw.district).trim() : "";
  const marketName = raw.market ? String(raw.market).trim() : "";
  const cropName = raw.commodity ? String(raw.commodity).trim() : "";
  const variety = raw.variety ? String(raw.variety).trim() : "";
  const cropType = raw.grade ? String(raw.grade).trim() : undefined;
  
  const minPrice = parseFloat(raw.min_price);
  const maxPrice = parseFloat(raw.max_price);
  const modalPrice = parseFloat(raw.modal_price);
  const priceDate = parseArrivalDate(raw.arrival_date || raw.reported_date);
  
  // Unit defaults to quintal as per AGMARKNET standard (Rs. / Quintal)
  const unit = raw.unit ? String(raw.unit).trim() : "quintal";

  return {
    cropName,
    cropType,
    marketName,
    state,
    district,
    variety,
    minPrice,
    maxPrice,
    modalPrice,
    unit,
    priceDate,
    source: "Government of India OGD / AGMARKNET",
    lastSyncedAt: syncTimestamp
  };
}

/**
 * Validates normalized record fields.
 */
function validateRecord(record) {
  if (!record.cropName) return { valid: false, reason: "Missing cropName/commodity" };
  if (!record.marketName) return { valid: false, reason: "Missing marketName/market" };
  if (!record.state) return { valid: false, reason: "Missing state" };
  if (!record.district) return { valid: false, reason: "Missing district" };
  if (!record.priceDate) return { valid: false, reason: "Missing or invalid priceDate" };
  
  if (isNaN(record.minPrice) || record.minPrice < 0) return { valid: false, reason: "Invalid minPrice" };
  if (isNaN(record.maxPrice) || record.maxPrice < 0) return { valid: false, reason: "Invalid maxPrice" };
  if (isNaN(record.modalPrice) || record.modalPrice < 0) return { valid: false, reason: "Invalid modalPrice" };
  
  if (record.minPrice > record.modalPrice || record.modalPrice > record.maxPrice) {
    return { valid: false, reason: `Price inconsistency: min(${record.minPrice}) <= modal(${record.modalPrice}) <= max(${record.maxPrice}) broken` };
  }

  return { valid: true };
}

/**
 * Fetches government market price records from data.gov.in and upserts them into MongoDB.
 */
async function syncGovernmentMarketPrices(options = {}) {
  const startTime = Date.now();
  const apiKey = process.env.DATA_GOV_API_KEY || "";
  const limit = options.limit || 100;
  const offset = options.offset || 0;
  
  const queryParams = new URLSearchParams({
    "format": "json",
    "limit": String(limit),
    "offset": String(offset)
  });

  if (apiKey) {
    queryParams.append("api-key", apiKey);
  }

  // Support filters for state, district, market, commodity
  if (options.state) queryParams.append("filters[state]", options.state);
  if (options.district) queryParams.append("filters[district]", options.district);
  if (options.market) queryParams.append("filters[market]", options.market);
  if (options.commodity || options.crop) queryParams.append("filters[commodity]", options.commodity || options.crop);

  const fetchUrl = `${OGD_BASE_URL}?${queryParams.toString()}`;
  console.log(`[GOV_SYNC] Initiating fetch from Government OGD API... (Filters: state=${options.state || "all"}, district=${options.district || "all"})`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        "User-Agent": "HumanLink-Backend/1.0",
        "Accept": "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[GOV_SYNC] OGD API Error HTTP ${response.status}:`, errText.substring(0, 300));
      return {
        success: false,
        sourceAvailable: false,
        error: `Government OGD API HTTP ${response.status}: ${response.statusText}`,
        recordsReceived: 0,
        insertedCount: 0,
        updatedCount: 0,
        rejectedCount: 0,
        durationMs: Date.now() - startTime
      };
    }

    const data = await response.json();
    const rawRecords = data.records || data.data || [];
    
    console.log(`[GOV_SYNC] Successfully received ${rawRecords.length} raw records from Government OGD API.`);

    if (rawRecords.length === 0) {
      return {
        success: true,
        sourceAvailable: true,
        message: "Government OGD API returned 0 records for the requested filters.",
        recordsReceived: 0,
        insertedCount: 0,
        updatedCount: 0,
        rejectedCount: 0,
        durationMs: Date.now() - startTime
      };
    }

    const syncTimestamp = new Date();
    const bulkOps = [];
    let acceptedCount = 0;
    let rejectedCount = 0;

    for (const raw of rawRecords) {
      const normalized = normalizeRecord(raw, syncTimestamp);
      const valResult = validateRecord(normalized);

      if (!valResult.valid) {
        rejectedCount++;
        continue;
      }

      acceptedCount++;

      // Upsert based on compound unique identity: cropName, marketName, state, district, priceDate, variety
      bulkOps.push({
        updateOne: {
          filter: {
            cropName: normalized.cropName,
            marketName: normalized.marketName,
            state: normalized.state,
            district: normalized.district,
            priceDate: normalized.priceDate,
            variety: normalized.variety || ""
          },
          update: { $set: normalized },
          upsert: true
        }
      });
    }

    let insertedCount = 0;
    let updatedCount = 0;

    if (bulkOps.length > 0) {
      const bulkResult = await MarketPrice.bulkWrite(bulkOps, { ordered: false });
      insertedCount = bulkResult.upsertedCount || 0;
      updatedCount = bulkResult.modifiedCount || 0;
    }

    const durationMs = Date.now() - startTime;
    console.log(`[GOV_SYNC] Sync complete in ${durationMs}ms. Received: ${rawRecords.length}, Accepted: ${acceptedCount}, Rejected: ${rejectedCount}, Inserted: ${insertedCount}, Updated: ${updatedCount}`);

    return {
      success: true,
      sourceAvailable: true,
      source: "Government of India OGD / AGMARKNET",
      recordsReceived: rawRecords.length,
      acceptedCount,
      rejectedCount,
      insertedCount,
      updatedCount,
      durationMs
    };

  } catch (err) {
    const durationMs = Date.now() - startTime;
    const isTimeout = err.name === "AbortError";
    const errorReason = isTimeout 
      ? "Government source request timed out (12s limit)" 
      : `Government source unavailable during verification (${err.message})`;

    console.warn(`[GOV_SYNC] Government Sync Warning: ${errorReason}`);

    return {
      success: false,
      sourceAvailable: false,
      error: errorReason,
      recordsReceived: 0,
      insertedCount: 0,
      updatedCount: 0,
      rejectedCount: 0,
      durationMs
    };
  }
}

module.exports = {
  syncGovernmentMarketPrices,
  normalizeRecord,
  validateRecord,
  parseArrivalDate,
  OGD_BASE_URL
};
