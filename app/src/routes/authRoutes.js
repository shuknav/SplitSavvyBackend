import express from "express";
import { loginEmailVerify } from "../controllers/authController.js";

const router = express.Router();

router.get("/check", loginEmailVerify);

export default router;
