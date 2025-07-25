import express from "express";
import {
  adminIdentiyVerify,
  TokenVerify,
  PasswordUpdate,
  AdminAdd,
  FetchAdminList,
  SuperUserPermissions,
  isSuperUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/verify", adminIdentiyVerify); // route to handle admin verification
router.post("/add", AdminAdd); // route to add new admin details
router.post("/add", AdminAdd);
router.get("/tokenverify", TokenVerify);
router.post("/passwordupdate", PasswordUpdate);
router.post("/list", FetchAdminList);
router.post("/superuserpermissions", SuperUserPermissions);
router.post("/issuperuser", isSuperUser);

export default router;
