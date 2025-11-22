import { pool } from "../config/connectDB.js";

// Mark attendance
export const markAttendance = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const { member_id, date, status } = req.body;

    // Verify member belongs to admin's gym before inserting
    const [memberCheck] = await pool.query(`
      SELECT m.member_id 
      FROM members m
      JOIN gyms g ON m.gym_id = g.gym_id
      WHERE m.member_id = ? AND g.admin_id = ?
    `, [member_id, admin_id]);

    if (memberCheck.length === 0) {
      return res.status(403).json({ message: "Unauthorized: Member not found or not in your gym" });
    }

    // Insert attendance
    const [result] = await pool.query(`
      INSERT INTO attendance (member_id, date, status)
      VALUES (?, ?, ?)
    `, [member_id, date, status || "present"]);

    res.status(201).json({ message: "Attendance marked!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const getAttendance = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const { member_id, date } = req.query;

    let query = `
      SELECT a.*
      FROM attendance a
      JOIN members m ON a.member_id = m.member_id
      JOIN gyms g ON m.gym_id = g.gym_id
      WHERE g.admin_id = ?
    `;
    const params = [admin_id];

    if (member_id) {
      query += " AND a.member_id = ?";
      params.push(member_id);
    }

    if (date) {
      query += " AND a.date = ?";
      params.push(date);
    }

    const [attendance] = await pool.query(query, params);
    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Delete attendance
export const deleteAttendance = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const attendance_id = req.params.attendance_id;

    const [result] = await pool.query(`
      DELETE a FROM attendance a
      JOIN members m ON a.member_id = m.member_id
      JOIN gyms g ON m.gym_id = g.gym_id
      WHERE a.attendance_id = ? AND g.admin_id = ?
    `, [attendance_id, admin_id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Record not found or unauthorized" });

    res.json({ message: "Attendance deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
