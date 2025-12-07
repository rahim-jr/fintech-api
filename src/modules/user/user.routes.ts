import { Router } from "express";
import * as userController from "./user.controller.js";

const router = Router();

// POST /api/v1/users/register
router.post("/register", userController.register);
router.post("/login", userController.login);

export default router; 
