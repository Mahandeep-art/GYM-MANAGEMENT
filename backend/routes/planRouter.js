import express from "express";
import { addPlan, getPlans, updatePlan, deletePlan } from "../controllers/planController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const planRouter = express.Router();

planRouter.post('/', requireSignIn, addPlan);
planRouter.get('/', requireSignIn, getPlans);
planRouter.put('/:plan_id', requireSignIn, updatePlan);
planRouter.delete('/:plan_id', requireSignIn, deletePlan);

export default planRouter;