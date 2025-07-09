import express from "express";
import {
  addToWaitlist,
  checkInWaitlist,
} from "../controllers/waitlistController.js";

const router = express.Router();

router.post("/add", addToWaitlist);
router.get("/check", checkInWaitlist);

export default router;
