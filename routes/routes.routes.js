import express from "express";
import {
    createUser,
    loginUser,
    getAgents,
    getTopAgents
} from "../controllers/users.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, loginSchema } from "../schemas/user.schemas.js";

const router = express.Router();

router.post("/", validate(createUserSchema), createUser);
router.post("/login", validate(loginSchema), loginUser);
router.get("/agents", authMiddleware, getAgents);
router.get("/top-agents", authMiddleware, getTopAgents);

export default router;