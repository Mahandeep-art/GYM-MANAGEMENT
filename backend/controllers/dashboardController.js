import { pool } from "../config/connectDB.js";

export const getDashboardStats = async (req, res) => {
    try {
        const admin_id = req.user.admin_id;

        // Use the View: gym_dashboard_stats
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

        res.json({
            total_members: stats[0].total_members || 0,
            total_trainers: stats[0].total_trainers || 0,
            active_subscriptions: stats[0].active_subscriptions || 0,
            monthly_revenue: stats[0].monthly_revenue || 0
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAttendanceChart = async (req, res) => {
    try {
        const admin_id = req.user.admin_id;

        // Use the Stored Procedure: sp_GetAttendanceTrend
        const [results] = await pool.query('CALL sp_GetAttendanceTrend(?)', [admin_id]);

        // Results from stored procedure are in the first element of the array
        const attendance = results[0];

        res.json({ data: attendance });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
