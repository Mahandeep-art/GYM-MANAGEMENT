import {pool} from "../config/connectDB.js";

export const addGym = async (req,res)=>{
    try{
        const {gym_name,address,phone}=req.body;
        const admin_id = req.user.admin_id;

        if(!gym_name || !address){
            return res.status(400).json({ message: "Gym name is required." });
        }

        const [result] = await pool.query(
            "INSERT INTO gyms (admin_id,gym_name,address,phone) VALUES (?,?,?,?)",
            [admin_id,gym_name,address,phone]
        );
        res.status(201).json({
        message: "Gym added successfully",
        gym_id: result.insertId
        });
    }catch(error){
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};


export const getGyms = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;

    const [gyms] = await pool.query(
      "SELECT * FROM gyms WHERE admin_id = ?",
      [admin_id]
    );

    res.json({ gyms });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};


export const updateGym = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const gym_id = req.params.gym_id;
    const { gym_name, address, phone } = req.body;

    // Check gym belongs to this admin
    const [gyms] = await pool.query(
      "SELECT * FROM gyms WHERE gym_id = ? AND admin_id = ?",
      [gym_id, admin_id]
    );
    if (gyms.length === 0) return res.status(404).json({ message: "Gym not found or not owned by you." });

    await pool.query(
      "UPDATE gyms SET gym_name = ?, address = ?, phone = ? WHERE gym_id = ? AND admin_id = ?",
      [gym_name, address, phone, gym_id, admin_id]
    );
    res.json({ message: "Gym updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};


export const deleteGym = async (req, res) => {
  try {
    const admin_id = req.user.admin_id;
    const gym_id = req.params.gym_id;

    // Check gym exists and belongs to admin
    const [gyms] = await pool.query(
      "SELECT * FROM gyms WHERE gym_id = ? AND admin_id = ?",
      [gym_id, admin_id]
    );
    if (gyms.length === 0) return res.status(404).json({ message: "Gym not found or not owned by you." });



    await pool.query(
      "DELETE FROM gyms WHERE gym_id = ? AND admin_id = ?",
      [gym_id, admin_id]
    );

    res.json({ message: "Gym deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};
