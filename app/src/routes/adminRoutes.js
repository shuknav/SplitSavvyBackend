import express from "express";
import {
  AdminIdentiyVerify,
  TokenVerify,
  PasswordUpdate,
  AdminAdd,
  FetchAdminList,
  SuperUserPermissions,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/verify", AdminIdentiyVerify); // route to handle admin verification
router.post("/add", AdminAdd); // route to add new admin details
router.post("/add", AdminAdd);
router.get("/tokenverify", TokenVerify);
router.post("/passwordupdate", PasswordUpdate);
router.post("/list", FetchAdminList);
router.post("/superuserpermissions", SuperUserPermissions);

export default router;
