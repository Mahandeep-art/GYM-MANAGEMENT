import { addMember, getMembers, updateMember, deleteMember } from "../controllers/memberController.js";
import express from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const memberRouter = express.Router();


memberRouter.post('/', requireSignIn, addMember);
memberRouter.get('/', requireSignIn, getMembers);
memberRouter.put('/:member_id', requireSignIn, updateMember);
memberRouter.delete('/:member_id', requireSignIn, deleteMember);

export default memberRouter;