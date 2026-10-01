require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.warn("⚠️ Server starting without active DB connection:", error.message);
    }

    app.listen(PORT, () => {
        console.log(`🚜 HumanLink server running on port ${PORT}`);
    });
};

startServer();