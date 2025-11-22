import { pool } from "../config/connectDB.js";

export const getDashboardStats = async (req, res) => {
    try {
        const admin_id = req.user.admin_id;

        // Get all gym_ids for this admin
        const [gyms] = await pool.query("SELECT gym_id FROM gyms WHERE admin_id = ?", [admin_id]);
        const gymIds = gyms.map(gym => gym.gym_id);

        if (gymIds.length === 0) {
            return res.json({
                total_members: 0,
                total_trainers: 0,
                active_subscriptions: 0,
                monthly_revenue: 0
            });
        }

        // Total Members
        const [members] = await pool.query(`SELECT COUNT(*) as count FROM members WHERE gym_id IN (?)`, [gymIds]);

        // Total Trainers
        const [trainers] = await pool.query(`SELECT COUNT(*) as count FROM trainers WHERE gym_id IN (?)`, [gymIds]);

        // Active Subscriptions
        const [activeSubs] = await pool.query(
            `SELECT COUNT(*) as count FROM subscriptions s 
       JOIN members m ON s.member_id = m.member_id 
       WHERE m.gym_id IN (?) AND s.is_active = TRUE`,
            [gymIds]
        );

        // Monthly Revenue (This month)
        const [revenue] = await pool.query(
            `SELECT SUM(amount_paid) as total FROM subscriptions s 
       JOIN members m ON s.member_id = m.member_id 
       WHERE m.gym_id IN (?) AND MONTH(s.created_at) = MONTH(CURRENT_DATE()) AND YEAR(s.created_at) = YEAR(CURRENT_DATE())`,
            [gymIds]
        );

        res.json({
            total_members: members[0].count,
            total_trainers: trainers[0].count,
            active_subscriptions: activeSubs[0].count,
            monthly_revenue: revenue[0].total || 0
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAttendanceChart = async (req, res) => {
    try {
        const admin_id = req.user.admin_id;

        // Get all gym_ids for this admin
        const [gyms] = await pool.query("SELECT gym_id FROM gyms WHERE admin_id = ?", [admin_id]);
        const gymIds = gyms.map(gym => gym.gym_id);

        if (gymIds.length === 0) return res.json({ data: [] });

        // Get attendance count for last 7 days
        const [attendance] = await pool.query(
            `SELECT DATE(date) as date, COUNT(*) as count 
       FROM attendance a 
       JOIN members m ON a.member_id = m.member_id 
       WHERE m.gym_id IN (?) AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) 
       GROUP BY DATE(date) 
       ORDER BY date ASC`,
            [gymIds]
        );

        res.json({ data: attendance });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
