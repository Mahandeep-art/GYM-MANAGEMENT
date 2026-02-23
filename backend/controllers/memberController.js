import { pool } from "../config/connectDB.js"

export const addMember = async (req, res) => {
  try {
    const admin_id = req.user.admin_id; // from JWT
    const { gym_id, name, phone, email, gender, trainer_id, join_date } = req.body;

    // Verify the gym belongs to admin
    const [gyms] = await pool.query("SELECT * FROM gyms WHERE gym_id = ? AND admin_id = ?", [gym_id, admin_id]);
    if (gyms.length === 0) return res.status(403).json({ message: "Gym not found or not owned by you." });

    const [result] = await pool.query(
      `INSERT INTO members (gym_id, name, phone, email, gender, trainer_id, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        gym_id,
        name,
        phone,
        email,
        gender,
        trainer_id || null,
        join_date || null
      ]
    );
    res.status(201).json({ message: "Member added successfully!", member_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    // Get all gym_ids for this admin
    const [gyms] = await pool.query("SELECT gym_id FROM gyms WHERE admin_id = ?", [admin_id]);
    const gymIds = gyms.map(gym => gym.gym_id);
    if (gymIds.length === 0) return res.json({ members: [] });

    const [members] = await pool.query(
      `SELECT m.*, t.name as trainer_name 
       FROM members m 
       LEFT JOIN trainers t ON m.trainer_id = t.trainer_id
       WHERE m.gym_id IN (?)`,
      [gymIds]
    );
    res.json({ members });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update member
export const updateMember = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const member_id = req.params.member_id;
    const { name, phone, email, gender, trainer_id, join_date, membership_status } = req.body;

    // check Entity belongs to admins gym
    const [member] = await pool.query(
      `SELECT m.* FROM members m JOIN gyms g ON m.gym_id = g.gym_id WHERE m.member_id = ? AND g.admin_id = ?`,
      [member_id, admin_id]
    );
    if (member.length === 0) return res.status(404).json({ message: "Member not found or not in your gym." });

    await pool.query(
      `UPDATE members SET name=?, phone=?, email=?, gender=?, trainer_id=?, join_date=?, membership_status=? WHERE member_id=?`,
      [name, phone, email, gender, trainer_id || null, join_date || null, membership_status, member_id]
    );
    res.json({ message: "Member updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete member
export const deleteMember = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const member_id = req.params.member_id;

    const [member] = await pool.query(
      `SELECT m.* FROM members m JOIN gyms g ON m.gym_id = g.gym_id WHERE m.member_id = ? AND g.admin_id = ?`,
      [member_id, admin_id]
    );
    if (member.length === 0) return res.status(404).json({ message: "Member not found or not in your gym." });

    await pool.query(`DELETE FROM members WHERE member_id = ?`, [member_id]);
    res.json({ message: "Member deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};