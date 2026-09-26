const express = require("express");
const {
    getMarketPrices,
    getMarketPriceById,
    getPriceHistory
} = require("../controllers/marketPriceController");

const router = express.Router();

// Public GET routes for market prices
router.get("/", getMarketPrices);
router.get("/history/:cropName", getPriceHistory);
router.get("/:id", getMarketPriceById);

module.exports = router;
