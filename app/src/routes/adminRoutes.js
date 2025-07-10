import express from "express";
import {
  AdminIdentiyVerify,
  AdminDetailAdd,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/verify", AdminIdentiyVerify); // route to handle admin verification
router.post("/add", AdminDetailAdd); // route to add new admin details

export default router;
