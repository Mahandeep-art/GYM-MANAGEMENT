import express from "express"

import { registerAdmin,loginAdmin } from "../controllers/authController.js"

const authRouter = express.Router();

authRouter.post("/register",registerAdmin);

authRouter.post("/login",loginAdmin);

export default authRouter;