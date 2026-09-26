require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const seedMarketPrices = require("./utils/seedMarketPrices");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await seedMarketPrices();

        app.listen(PORT, () => {
            console.log(`🚜 HumanLink server running on port ${PORT}`);
            console.log(`🌐 http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();