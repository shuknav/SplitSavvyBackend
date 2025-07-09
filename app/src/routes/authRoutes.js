import express from "express";
import {
  loginEmailVerify,
  loginVerify,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/check", loginEmailVerify);
router.get("/login", loginVerify);

export default router;
