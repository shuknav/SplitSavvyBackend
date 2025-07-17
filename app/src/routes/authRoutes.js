import express from "express";
import {
  loginEmailVerify,
  loginVerify,
  TokenVerify,
  UserDetails,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/check", loginEmailVerify); //route handler for email address verification
router.post("/login", loginVerify); //route handler to verify identity
router.get("/tokenverify", TokenVerify);
router.get("/userdetails", UserDetails);

export default router;
