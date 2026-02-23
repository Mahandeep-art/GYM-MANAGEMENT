import { pool } from "../config/connectDB.js";

// Add Plan
export const addPlan = async (req, res) => {
  try {
    const admin_id = req.user.admin_id; // From JWT
    const { gym_id, plan_name, duration, price } = req.body;

    // Verify gym belongs to admin
    const [gyms] = await pool.query("SELECT * FROM gyms WHERE gym_id = ? AND admin_id = ?", [gym_id, admin_id]);
    if (gyms.length === 0) return res.status(403).json({ message: "Gym not found or not owned by you." });

    await pool.query(
      "INSERT INTO plans (gym_id, plan_name, duration, price) VALUES (?, ?, ?, ?)",
      [gym_id, plan_name, duration, price]
    );
    res.status(201).json({ message: "Plan added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Plans
export const getPlans = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;

    // Get all gym_ids for this admin
    const [gyms] = await pool.query("SELECT gym_id FROM gyms WHERE admin_id = ?", [admin_id]);
    const gymIds = gyms.map(gym => gym.gym_id);

    if (gymIds.length === 0) return res.json({ plans: [] });

    const [plans] = await pool.query(
      `SELECT p.*, g.gym_name FROM plans p JOIN gyms g ON p.gym_id = g.gym_id WHERE p.gym_id IN (?)`,
      [gymIds]
    );

    res.json({ plans });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Plan
export const updatePlan = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const plan_id = req.params.plan_id;
    const { plan_name, duration, price } = req.body;

    // Verifying owner
    const [plan] = await pool.query(
      "SELECT p.* FROM plans p JOIN gyms g ON p.gym_id = g.gym_id WHERE p.plan_id = ? AND g.admin_id = ?",
      [plan_id, admin_id]
    );
    if (plan.length === 0) return res.status(404).json({ message: "Plan not found or not in your gym." });

    await pool.query(
      "UPDATE plans SET plan_name=?, duration=?, price=? WHERE plan_id=?",
      [plan_name, duration, price, plan_id]
    );
    res.json({ message: "Plan updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Plan
export const deletePlan = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const plan_id = req.params.plan_id;

    // Confirm the plan belongs to an admin's gym
    const [plans] = await pool.query(
      "SELECT p.* FROM plans p JOIN gyms g ON p.gym_id = g.gym_id WHERE p.plan_id = ? AND g.admin_id = ?",
      [plan_id, admin_id]
    );
    if (plans.length === 0) return res.status(404).json({ message: "Plan not found or not in your gym." });

    await pool.query(
      "DELETE FROM plans WHERE plan_id = ?",
      [plan_id]
    );
    res.json({ message: "Plan deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
