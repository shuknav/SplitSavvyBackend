import express from "express";
import {
  loginEmailVerify,
  loginVerify,
  TokenVerify,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/check", loginEmailVerify); //route handler for email address verification
router.post("/login", loginVerify); //route handler to verify identity
router.get("/tokenverify", TokenVerify);

export default router;
