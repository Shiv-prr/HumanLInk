const MarketPrice = require("../models/MarketPrice");
const mongoose = require("mongoose");

// ============================
// GET ALL MARKET PRICES WITH FILTERING
// ============================
const getMarketPrices = async (req, res) => {
    try {
        const { crop, state, district, market, sort } = req.query;

        const filter = {};

        if (crop && crop.trim()) {
            filter.cropName = { $regex: new RegExp(`^${crop.trim()}$`, "i") };
        }

        if (state && state.trim()) {
            filter.state = { $regex: new RegExp(`^${state.trim()}$`, "i") };
        }

        if (district && district.trim()) {
            filter.district = { $regex: new RegExp(`^${district.trim()}$`, "i") };
        }

        if (market && market.trim()) {
            filter.marketName = { $regex: new RegExp(market.trim(), "i") };
        }

        let sortOption = { modalPrice: -1 }; // Default: highest modal price first
        if (sort === "lowest") {
            sortOption = { modalPrice: 1 };
        } else if (sort === "market") {
            sortOption = { marketName: 1 };
        }

        const marketPrices = await MarketPrice.find(filter).sort(sortOption);

        // Compute summary metrics on displayed records
        let summary = {
            marketsFound: marketPrices.length,
            lowestModalPrice: 0,
            highestModalPrice: 0,
            averageModalPrice: 0
        };

        if (marketPrices.length > 0) {
            const modalPrices = marketPrices.map(mp => mp.modalPrice);
            summary.lowestModalPrice = Math.min(...modalPrices);
            summary.highestModalPrice = Math.max(...modalPrices);
            const sum = modalPrices.reduce((acc, curr) => acc + curr, 0);
            summary.averageModalPrice = Math.round(sum / modalPrices.length);
        }

        // Get filter options (distinct crops, states, districts) for frontend dropdowns
        const availableCrops = await MarketPrice.distinct("cropName");
        const availableStates = await MarketPrice.distinct("state");
        const availableDistricts = await MarketPrice.distinct("district");

        res.status(200).json({
            success: true,
            count: marketPrices.length,
            summary,
            marketPrices,
            filterOptions: {
                crops: availableCrops,
                states: availableStates,
                districts: availableDistricts
            }
        });
    } catch (error) {
        console.error("Get market prices error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load market prices. Please try again."
        });
    }
};

// ============================
// GET SINGLE MARKET PRICE BY ID
// ============================
const getMarketPriceById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Market price record not found"
            });
        }

        const marketPrice = await MarketPrice.findById(id);

        if (!marketPrice) {
            return res.status(404).json({
                success: false,
                message: "Market price record not found"
            });
        }

        res.status(200).json({
            success: true,
            marketPrice
        });
    } catch (error) {
        console.error("Get market price by id error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load market price details. Please try again."
        });
    }
};

// ============================
// GET PRICE HISTORY FOR A CROP
// ============================
const getPriceHistory = async (req, res) => {
    try {
        const { cropName } = req.params;
        const { marketName } = req.query;

        if (!cropName) {
            return res.status(400).json({
                success: false,
                message: "Crop name is required"
            });
        }

        const filter = {
            cropName: { $regex: new RegExp(`^${cropName.trim()}$`, "i") }
        };

        if (marketName && marketName.trim()) {
            filter.marketName = { $regex: new RegExp(marketName.trim(), "i") };
        }

        const history = await MarketPrice.find(filter)
            .sort({ priceDate: 1 })
            .limit(30);

        res.status(200).json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        console.error("Get price history error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load price trend data. Please try again."
        });
    }
};

module.exports = {
    getMarketPrices,
    getMarketPriceById,
    getPriceHistory
};
