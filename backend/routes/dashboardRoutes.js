import express from "express";
import { getDashboardStats, getAttendanceChart } from "../controllers/dashboardController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get('/stats', requireSignIn, getDashboardStats);
dashboardRouter.get('/chart', requireSignIn, getAttendanceChart);

export default dashboardRouter;
