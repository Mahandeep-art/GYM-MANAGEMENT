import bcrypt, { hash } from "bcryptjs";
import {pool} from "../config/connectDB.js";
import { generateToken } from "../utils/generateToken.js";

//Refgister as Admin

export const registerAdmin = async  (req,res)=>{
    try{
        const {username,email,password} = req.body;

        if (!email || !password || !username)
            return res.status(400).json({ message: "All fields required" });

        // Check if email already exists
        const [emailExists] = await pool.query(
        "SELECT * FROM Admin WHERE email = ?",
        [email]
        );

        if (emailExists.length > 0)
        return res.status(400).json({ message: "Email already registered" });


        const hashedPassword = await bcrypt.hash(password,10);

        const [result]=await pool.query(
            "INSERT INTO Admin(username,email,password) VALUES(?,?,?)",
            [username,email,hashedPassword]
        );

        return res.status(201).json({
            message:"Admin registered successfully",
            user_id:result.insertId,
        });
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }

};

//Admin Login

export const loginAdmin= async (req,res)=>{
    try{
        const{email,password}=req.body;

        const [rows] = await pool.query(
        "SELECT * FROM Admin WHERE email = ?",
        [email]
        );

        if (rows.length === 0)
        return res.status(400).json({ message: "Invalid username or password" });
        
        const admin =rows[0];

        //compare password

        const isMatch = await bcrypt.compare(password,admin.password);
        if(!isMatch){
             return res.status(400).json({ message: "Invalid username or password" });
        }

        //if match create token

        const token = generateToken(admin);

        res.json({
        message: "Login successful",
        token,
        admin: {
            admin_id: admin.admin_id,
            username: admin.username,
        }
        });
    }catch(error){
         res.status(500).json({ message: "Server error" });
    }
}