import express from "express";
import {
  addToWaitlist,
  checkInWaitlist,
  fetchWaitlistData,
  ApproveWaitlist,
  RejectWaitlist,
  tokenValidation,
  onBoardUser,
} from "../controllers/waitlistController.js";

const router = express.Router();

router.post("/add", addToWaitlist); //route handler to add and check for edge cases in waitlist
router.get("/check", checkInWaitlist); //route handler to check the status in waitlist
router.post("/list", fetchWaitlistData);
router.post("/reject", RejectWaitlist);
router.post("/approve", ApproveWaitlist);
router.get("/tokenverify", tokenValidation);
router.post("/onboard", onBoardUser);

export default router;
