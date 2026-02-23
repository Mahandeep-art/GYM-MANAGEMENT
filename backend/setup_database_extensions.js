import { pool } from "./config/connectDB.js";

async function setupDatabaseExtensions() {
    try {
        console.log("Starting database extensions setup...");

        // 1. Create View: gym_dashboard_stats
        console.log("Creating View: gym_dashboard_stats...");
        await pool.query(`
            CREATE OR REPLACE VIEW gym_dashboard_stats AS
            SELECT 
                g.gym_id,
                g.admin_id,
                (SELECT COUNT(*) FROM members m WHERE m.gym_id = g.gym_id) AS total_members,
                (SELECT COUNT(*) FROM trainers t WHERE t.gym_id = g.gym_id) AS total_trainers,
                (SELECT COUNT(*) FROM subscriptions s 
                 JOIN members m ON s.member_id = m.member_id 
                 WHERE m.gym_id = g.gym_id AND s.is_active = TRUE) AS active_subscriptions,
                (SELECT COALESCE(SUM(s.amount_paid), 0) FROM subscriptions s 
                 JOIN members m ON s.member_id = m.member_id 
                 WHERE m.gym_id = g.gym_id 
                 AND MONTH(s.created_at) = MONTH(CURRENT_DATE()) 
                 AND YEAR(s.created_at) = YEAR(CURRENT_DATE())) AS monthly_revenue
            FROM gyms g;
        `);
        console.log("View created successfully.");

        // 2. Create Stored Procedure: sp_GetAttendanceTrend
        console.log("Creating Stored Procedure: sp_GetAttendanceTrend...");

        // Drop if exists to avoid errors on re-run
        await pool.query(`DROP PROCEDURE IF EXISTS sp_GetAttendanceTrend`);

        await pool.query(`
            CREATE PROCEDURE sp_GetAttendanceTrend(IN p_admin_id INT)
            BEGIN
                SELECT DATE(a.date) as date, COUNT(*) as count 
                FROM attendance a 
                JOIN members m ON a.member_id = m.member_id 
                JOIN gyms g ON m.gym_id = g.gym_id
                WHERE g.admin_id = p_admin_id 
                AND a.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
                GROUP BY DATE(a.date) 
                ORDER BY date ASC;
            END
        `);
        console.log("Stored Procedure created successfully.");

        console.log("All database extensions applied successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error setting up database extensions:", error);
        process.exit(1);
    }
}

setupDatabaseExtensions();
