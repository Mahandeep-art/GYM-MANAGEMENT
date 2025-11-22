import express from "express";
import { assignSubscription, getMemberSubscriptions } from "../controllers/subscriptionController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const subscriptionRouter = express.Router();

subscriptionRouter.post('/assign', requireSignIn, assignSubscription);
subscriptionRouter.get('/member/:member_id', requireSignIn, getMemberSubscriptions);

export default subscriptionRouter;
