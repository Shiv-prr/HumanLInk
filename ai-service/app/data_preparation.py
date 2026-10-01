"""
HumanLink AI Service - Market Price Data Preparation Module

==================================================
EXPLANATORY COMMENTS FOR DEVELOPERS & BEGINNERS:
==================================================

1. WHY PREPARE RAW MARKET DATA BEFORE ML?
   Raw database records contain missing fields, inconsistent dates, invalid price
   relationships, or unsorted timelines. Data preparation cleans data, extracts
   time features, generates historical (lag) observations, and defines targets.

2. WHAT IS A FEATURE?
   A feature is an input variable used by a machine learning model to make predictions.
   Example features: `cropName`, `marketName`, `previous_price`, `month`, `day_of_week`.

3. WHAT IS A TARGET?
   A target is the actual ground-truth value the model aims to predict.
   In our price model, `target_price` is the `modalPrice` of the current historical record.

4. WHAT DO HISTORICAL / LAG FEATURES MEAN?
   Lag features represent past values of the target variable from prior timestamps.
   - `previous_price`: Price from 1 record ago (t-1)
   - `price_2_records_ago`: Price from 2 records ago (t-2)
   - `price_3_records_ago`: Price from 3 records ago (t-3)

5. WHY CHRONOLOGICAL ORDERING MATTERS & WHAT IS DATA LEAKAGE?
   Data leakage occurs when future information (e.g., tomorrow's or next week's price)
   is accidentally included in input features used to predict a target.
   Sorting records chronologically ensures that a feature ONLY contains information
   from past timestamps (t-1, t-2, ...), preventing the model from "cheating" during training.

6. WHY CROP + MARKET HISTORIES MUST REMAIN SEPARATED?
   Price trends for Wheat in Ludhiana Mandi are independent of Rice in Amritsar Mandi.
   Grouping by `(cropName, marketName)` ensures lag features are calculated strictly within
   the same crop and market context.

7. DATASET LIMITATION NOTICE:
   The current Phase 5 market-price records are controlled development/sample data.
   They are useful for developing and testing the data pipeline, but they should not be
   represented as a production-scale historical dataset.
"""

from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional


def validate_market_price_record(record: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validates a single market price record against business rules and schemas.
    
    Rules enforced:
    1. Required fields: cropName (or crop), marketName (or market), state, district, priceDate (or date), modalPrice, minPrice, maxPrice.
    2. Strings must not be empty or whitespace-only.
    3. Numeric price fields must be numbers >= 0.
    4. Business rule: minPrice <= modalPrice <= maxPrice.
    5. Valid date format.
    """
    crop_name = record.get("cropName") or record.get("crop")
    market_name = record.get("marketName") or record.get("market")
    state = record.get("state")
    district = record.get("district")
    price_date = record.get("priceDate") or record.get("date")

    # String field non-empty check
    for field_name, value in [("cropName", crop_name), ("marketName", market_name), ("state", state), ("district", district)]:
        if not value or not isinstance(value, str) or not value.strip():
            return False, f"Missing or invalid string for '{field_name}'"

    # Numeric price checks
    min_price = record.get("minPrice")
    modal_price = record.get("modalPrice")
    max_price = record.get("maxPrice")

    for field_name, val in [("minPrice", min_price), ("modalPrice", modal_price), ("maxPrice", max_price)]:
        if val is None or not isinstance(val, (int, float)) or val < 0:
            return False, f"Missing or negative price for '{field_name}': {val}"

    # Business rule check: minPrice <= modalPrice <= maxPrice
    if not (min_price <= modal_price <= max_price):
        return False, f"Invalid price ordering: minPrice ({min_price}) <= modalPrice ({modal_price}) <= maxPrice ({max_price}) violated"

    # Date parsing check
    if not price_date:
        return False, "Missing priceDate"

    parsed_date = parse_date(price_date)
    if not parsed_date:
        return False, f"Invalid priceDate format: {price_date}"

    return True, None


def parse_date(date_val: Any) -> Optional[datetime]:
    """
    Helper function to parse various date formats into a Python datetime object.
    """
    if isinstance(date_val, datetime):
        return date_val
    if isinstance(date_val, str):
        date_str = date_val.strip().replace("Z", "+00:00")
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
            try:
                return datetime.strptime(date_str.split("+")[0].split(".")[0], fmt)
            except ValueError:
                continue
    return None


def extract_date_features(dt: datetime) -> Dict[str, int]:
    """
    Extracts numerical calendar features from a datetime object.
    Returns year, month, day, and day_of_week (0=Monday, 6=Sunday).
    """
    return {
        "year": dt.year,
        "month": dt.month,
        "day": dt.day,
        "day_of_week": dt.weekday()
    }


def prepare_training_dataset(records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Transforms raw market price records into chronologically ordered training examples with lag features.
    
    Returns:
    - prepared_rows: List of training row dictionaries containing input features and target_price.
    - summary: Dataset summary report dictionary.
    """
    total_raw_records = len(records)
    valid_records = []
    invalid_records_info = []

    # 1. Validate raw records
    for idx, rec in enumerate(records):
        is_valid, err_msg = validate_market_price_record(rec)
        if is_valid:
            valid_records.append(rec)
        else:
            invalid_records_info.append({"index": idx, "record": rec, "reason": err_msg})

    # 2. Group valid records by (cropName, marketName)
    groups: Dict[Tuple[str, str], List[Dict[str, Any]]] = {}
    for rec in valid_records:
        c_name = (rec.get("cropName") or rec.get("crop")).strip()
        m_name = (rec.get("marketName") or rec.get("market")).strip()
        key = (c_name, m_name)
        if key not in groups:
            groups[key] = []
        groups[key].append(rec)

    training_rows = []
    excluded_insufficient_history = 0
    all_dates = []

    # 3. Process each group chronologically
    for (crop_name, market_name), group_records in groups.items():
        # Sort chronologically by priceDate (oldest first)
        group_records.sort(key=lambda r: parse_date(r.get("priceDate") or r.get("date")))

        for i in range(len(group_records)):
            current_rec = group_records[i]
            current_dt = parse_date(current_rec.get("priceDate") or current_rec.get("date"))
            all_dates.append(current_dt)

            # Insufficient history check: First record in group has no prior historical observation
            if i < 1:
                excluded_insufficient_history += 1
                continue

            prev_rec = group_records[i - 1]
            prev_price = float(prev_rec.get("modalPrice"))

            price_2_ago = float(group_records[i - 2].get("modalPrice")) if i >= 2 else None
            price_3_ago = float(group_records[i - 3].get("modalPrice")) if i >= 3 else None

            date_feats = extract_date_features(current_dt)

            training_row = {
                "cropName": crop_name,
                "marketName": market_name,
                "district": current_rec.get("district", "").strip(),
                "state": current_rec.get("state", "").strip(),
                "date": current_dt.strftime("%Y-%m-%d"),
                "year": date_feats["year"],
                "month": date_feats["month"],
                "day": date_feats["day"],
                "day_of_week": date_feats["day_of_week"],
                "previous_price": prev_price,
                "price_2_records_ago": price_2_ago,
                "price_3_records_ago": price_3_ago,
                "target_price": float(current_rec.get("modalPrice"))
            }

            training_rows.append(training_row)

    # 4. Generate Summary Report
    all_crops = set(k[0] for k in groups.keys())
    all_markets = set(k[1] for k in groups.keys())
    earliest_date = min(all_dates).strftime("%Y-%m-%d") if all_dates else "N/A"
    latest_date = max(all_dates).strftime("%Y-%m-%d") if all_dates else "N/A"

    summary = {
        "total_raw_records": total_raw_records,
        "valid_records": len(valid_records),
        "invalid_records": len(invalid_records_info),
        "number_of_crops": len(all_crops),
        "number_of_markets": len(all_markets),
        "number_of_groups": len(groups),
        "earliest_date": earliest_date,
        "latest_date": latest_date,
        "training_rows_generated": len(training_rows),
        "rows_excluded_insufficient_history": excluded_insufficient_history,
        "invalid_records_details": invalid_records_info
    }

    return training_rows, summary
