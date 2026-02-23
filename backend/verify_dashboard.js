import { pool } from "./config/connectDB.js";

async function verifyDashboard() {
    try {
        console.log("Verifying Dashboard Extensions...");

        // Get an admin ID to test with
        const [admins] = await pool.query("SELECT admin_id FROM Admin LIMIT 1");
        if (admins.length === 0) {
            console.log("No admins found. Cannot verify.");
            process.exit(0);
        }
        const admin_id = admins[0].admin_id;
        console.log(`Testing with Admin ID: ${admin_id}`);

        // 1. Test View
        console.log("Testing View: gym_dashboard_stats...");
        const [stats] = await pool.query(
            `SELECT 
                SUM(total_members) as total_members, 
                SUM(total_trainers) as total_trainers, 
                SUM(active_subscriptions) as active_subscriptions, 
                SUM(monthly_revenue) as monthly_revenue 
             FROM gym_dashboard_stats 
             WHERE admin_id = ?`,
            [admin_id]
        );
        console.log("View Result:", stats[0]);

        // 2. Test Stored Procedure
        console.log("Testing Stored Procedure: sp_GetAttendanceTrend...");
        const [results] = await pool.query('CALL sp_GetAttendanceTrend(?)', [admin_id]);
        console.log("Stored Procedure Result:", results[0]);

        console.log("Verification successful!");
        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verifyDashboard();
