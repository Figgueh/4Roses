import express from "express";
import { getAllUsersInfo, getFullUserInfo, getUserInfo } from "../controllers/userController.js";

const router = express.Router();

router.get("/allUserData", getAllUsersInfo);
router.get("/:id", getUserInfo);
router.get("/fullData/:id", getFullUserInfo);

export default router;
