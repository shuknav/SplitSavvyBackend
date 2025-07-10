import express from "express";
import {
  AdminIdentiyVerify,
  AdminDetailAdd,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/verify", AdminIdentiyVerify);
router.post("/add", AdminDetailAdd);

export default router;
