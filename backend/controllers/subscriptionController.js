import { pool } from "../config/connectDB.js";

// Assign Subscription
export const assignSubscription = async (req, res) => {
    try {
        const admin_id = req.user.admin_id;
        const { member_id, plan_id, start_date, amount_paid } = req.body;

        // Verify member belongs to admin
        const [member] = await pool.query(
            `SELECT m.* FROM members m JOIN gyms g ON m.gym_id = g.gym_id WHERE m.member_id = ? AND g.admin_id = ?`,
            [member_id, admin_id]
        );
        if (member.length === 0) return res.status(404).json({ message: "Member not found or permission denied." });

        // Get Plan details to calculate end_date
        const [plan] = await pool.query("SELECT * FROM plans WHERE plan_id = ?", [plan_id]);
        if (plan.length === 0) return res.status(404).json({ message: "Plan not found." });

        const duration = plan[0].duration;
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + duration);
        const end_date = endDateObj.toISOString().split('T')[0];

        // Deactivate previous active subscriptions for this member
        await pool.query(`UPDATE subscriptions SET is_active = FALSE WHERE member_id = ?`, [member_id]);

        // Create new subscription
        const [result] = await pool.query(
            `INSERT INTO subscriptions (member_id, plan_id, start_date, end_date, is_active, amount_paid) VALUES (?, ?, ?, ?, TRUE, ?)`,
            [member_id, plan_id, start_date, end_date, amount_paid]
        );

        // Update member status to active
        await pool.query(`UPDATE members SET membership_status = 'active' WHERE member_id = ?`, [member_id]);

        res.status(201).json({ message: "Subscription assigned successfully", subscription_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get Subscriptions for a Member
export const getMemberSubscriptions = async (req, res) => {
    try {
        const admin_id = req.user.admin_id;
        const member_id = req.params.member_id;

        // Verify ownership
        const [member] = await pool.query(
            `SELECT m.* FROM members m JOIN gyms g ON m.gym_id = g.gym_id WHERE m.member_id = ? AND g.admin_id = ?`,
            [member_id, admin_id]
        );
        if (member.length === 0) return res.status(404).json({ message: "Member not found or permission denied." });

        const [subscriptions] = await pool.query(
            `SELECT s.*, p.plan_name, p.price 
       FROM subscriptions s 
       JOIN plans p ON s.plan_id = p.plan_id 
       WHERE s.member_id = ? 
       ORDER BY s.created_at DESC`,
            [member_id]
        );

        res.json({ subscriptions });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
