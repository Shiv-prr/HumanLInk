const mongoose = require("mongoose");

const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const fallbackUri = "mongodb://127.0.0.1:27017/humanlink";

    try {
        await mongoose.connect(primaryUri, { family: 4, serverSelectionTimeoutMS: 3000 });
        console.log("✅ MongoDB connected successfully to primary database");
    } catch (error) {
        console.warn("⚠️ Primary MongoDB connection notice:", error.message);
        try {
            console.log("🔄 Attempting fallback connection to local MongoDB...");
            await mongoose.connect(fallbackUri, { family: 4, serverSelectionTimeoutMS: 3000 });
            console.log("✅ Connected to local fallback MongoDB successfully");
        } catch (fallbackError) {
            console.warn("⚠️ Database connection offline (Atlas IP whitelist / local DB unreachable). Disabling query buffering.");
            mongoose.set("bufferCommands", false);
        }
    }
};

module.exports = connectDB;