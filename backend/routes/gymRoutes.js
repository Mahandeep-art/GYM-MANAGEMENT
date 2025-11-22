import express from "express";
import { addGym,getGyms,updateGym,deleteGym } from "../controllers/gymController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";


const gymRouter = express.Router();

gymRouter.post('/',requireSignIn,addGym);
gymRouter.get('/', requireSignIn, getGyms);
gymRouter.put('/:gym_id', requireSignIn, updateGym);
gymRouter.delete('/:gym_id', requireSignIn, deleteGym);

export default gymRouter;