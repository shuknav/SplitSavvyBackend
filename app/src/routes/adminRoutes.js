import express from "express";
import {
  AdminIdentiyVerify,
  TokenVerify,
  PasswordUpdate,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/verify", AdminIdentiyVerify); // route to handle admin verification
// router.post("/add", AdminDetailAdd); // route to add new admin details
router.get("/tokenverify", TokenVerify);
router.post("/passwordupdate", PasswordUpdate);

export default router;
