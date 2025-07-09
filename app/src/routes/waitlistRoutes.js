import express from "express";
import {
  addToWaitlist,
  checkInWaitlist,
} from "../controllers/waitlistController.js";

const router = express.Router();

router.post("/add", addToWaitlist); //route handler to add and check for edge cases in waitlist
router.get("/check", checkInWaitlist); //route handler to check the status in waitlist

export default router;
