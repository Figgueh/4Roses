import express from "express";
import {
  createNewUser,
  getAllUsersInfo,
  getFullUserInfo,
  getUserInfo,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/allUserData", getAllUsersInfo);
router.get("/:id", getUserInfo);
router.get("/fullData/:id", getFullUserInfo);
router.post("/createUser", createNewUser);

export default router;
