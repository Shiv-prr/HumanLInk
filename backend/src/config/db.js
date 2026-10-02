const mongoose = require("mongoose");

const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    try {
        await mongoose.connect(primaryUri, { family: 4 });
        console.log("✅ MongoDB connected successfully to primary database");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;