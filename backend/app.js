import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import gymRouter from "./routes/gymRoutes.js";
import memberRouter from "./routes/memberRoutes.js"
import planRouter from "./routes/planRouter.js";
import trainerRouter from "./routes/trainerRouter.js";
import attendanceRouter from "./routes/attendanceRouter.js";
import subscriptionRouter from "./routes/subscriptionRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/gyms", gymRouter);
app.use("/api/members", memberRouter);
app.use("/api/plans", planRouter);
app.use("/api/trainers", trainerRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/dashboard", dashboardRouter);

export default app;