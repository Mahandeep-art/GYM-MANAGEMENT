import express from "express";
import { markAttendance, getAttendance, deleteAttendance } from "../controllers/attendanceController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const attendanceRouter = express.Router();

// Mark a member's attendance
attendanceRouter.post('/', requireSignIn, markAttendance);

// Get attendance (supports ?member_id=, ?date=)
attendanceRouter.get('/', requireSignIn, getAttendance);

// Undo/remove an attendance mark
attendanceRouter.delete('/:attendance_id', requireSignIn, deleteAttendance);

export default attendanceRouter;
