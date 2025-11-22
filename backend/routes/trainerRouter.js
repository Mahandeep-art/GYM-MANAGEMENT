import express from "express";
import { addTrainer, getTrainers, updateTrainer, deleteTrainer } from "../controllers/trainerController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const trainerRouter = express.Router();

trainerRouter.post('/', requireSignIn, addTrainer);
trainerRouter.get('/', requireSignIn, getTrainers);
trainerRouter.put('/:trainer_id', requireSignIn, updateTrainer);
trainerRouter.delete('/:trainer_id', requireSignIn, deleteTrainer);

export default trainerRouter;
