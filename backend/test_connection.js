import { pool } from "./config/connectDB.js";

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Successfully connected to database!");
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("Failed to connect to database:", error.message);
        process.exit(1);
    }
};

testConnection();
