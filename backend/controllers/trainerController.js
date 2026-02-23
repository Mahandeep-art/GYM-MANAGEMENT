import { pool } from "../config/connectDB.js";

// Add Trainer
export const addTrainer = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const { gym_id, name, phone, email, specialization, salary } = req.body;

    // Verify gym ownership
    const [gyms] = await pool.query("SELECT * FROM gyms WHERE gym_id = ? AND admin_id = ?", [gym_id, admin_id]);
    if (gyms.length === 0) return res.status(403).json({ message: "Gym not found or not owned by you." });

    const [result] = await pool.query(
      `INSERT INTO trainers (gym_id, name, phone, email, specialization, salary) VALUES (?, ?, ?, ?, ?, ?)`,
      [gym_id, name, phone, email, specialization, salary]
    );

    res.status(201).json({ message: "Trainer added successfully", trainer_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Trainers 
export const getTrainers = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;

    // Get all gym_ids for this admin
    const [gyms] = await pool.query("SELECT gym_id FROM gyms WHERE admin_id = ?", [admin_id]);
    const gymIds = gyms.map(gym => gym.gym_id);

    if (gymIds.length === 0) return res.json({ trainers: [] });

    const [trainers] = await pool.query(
      `SELECT t.*, g.gym_name FROM trainers t JOIN gyms g ON t.gym_id = g.gym_id WHERE t.gym_id IN (?)`,
      [gymIds]
    );

    res.json({ trainers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Trainer
export const updateTrainer = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const trainer_id = req.params.trainer_id;
    const { name, phone, email, specialization, salary } = req.body;

    // Verify ownership
    const [trainer] = await pool.query(
      `SELECT t.* FROM trainers t JOIN gyms g ON t.gym_id = g.gym_id WHERE t.trainer_id = ? AND g.admin_id = ?`,
      [trainer_id, admin_id]
    );

    if (trainer.length === 0) return res.status(404).json({ message: "Trainer not found or permission denied." });

    await pool.query(
      `UPDATE trainers SET name=?, phone=?, email=?, specialization=?, salary=? WHERE trainer_id=?`,
      [name, phone, email, specialization, salary, trainer_id]
    );

    res.json({ message: "Trainer updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Trainer
export const deleteTrainer = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const trainer_id = req.params.trainer_id;

    // Verify ownership
    const [trainer] = await pool.query(
      `SELECT t.* FROM trainers t JOIN gyms g ON t.gym_id = g.gym_id WHERE t.trainer_id = ? AND g.admin_id = ?`,
      [trainer_id, admin_id]
    );

    if (trainer.length === 0) return res.status(404).json({ message: "Trainer not found or permission denied." });

    await pool.query(`DELETE FROM trainers WHERE trainer_id = ?`, [trainer_id]);

    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
