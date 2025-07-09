import express from "express";
import {
  loginEmailVerify,
  loginVerify,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/check", loginEmailVerify); //route handler for email address verification
router.get("/login", loginVerify); //route handler to verify identity

export default router;
