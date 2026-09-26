const mongoose = require("mongoose");

const marketPriceSchema = new mongoose.Schema(
    {
        cropName: {
            type: String,
            required: [true, "Crop name is required"],
            trim: true
        },
        cropType: {
            type: String,
            trim: true
        },
        marketName: {
            type: String,
            required: [true, "Market name is required"],
            trim: true
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true
        },
        district: {
            type: String,
            required: [true, "District is required"],
            trim: true
        },
        marketLocation: {
            type: String,
            trim: true
        },
        minPrice: {
            type: Number,
            required: [true, "Minimum price is required"],
            min: [0, "Minimum price cannot be negative"]
        },
        maxPrice: {
            type: Number,
            required: [true, "Maximum price is required"],
            min: [0, "Maximum price cannot be negative"]
        },
        modalPrice: {
            type: Number,
            required: [true, "Modal price is required"],
            min: [0, "Modal price cannot be negative"],
            validate: {
                validator: function (val) {
                    if (this.minPrice !== undefined && this.maxPrice !== undefined) {
                        return val >= this.minPrice && val <= this.maxPrice;
                    }
                    return true;
                },
                message: "Modal price must be between minimum and maximum price"
            }
        },
        unit: {
            type: String,
            required: [true, "Unit is required"],
            default: "quintal",
            trim: true
        },
        priceDate: {
            type: Date,
            required: [true, "Price date is required"],
            default: Date.now
        },
        source: {
            type: String,
            trim: true,
            default: "Sample Market Data (Agmarknet simulation)"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("MarketPrice", marketPriceSchema);
