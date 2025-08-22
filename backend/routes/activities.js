import express from "express";
import {
  getActivities,
  getActivityIdByName,
  addActivity,
  updateActivity,
  deleteActivity,
} from "../controllers/activityController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getActivities);
router.get("/:activityName", getActivityIdByName);
router.post("/", upload.single("image"), addActivity);
router.put("/:id", upload.single("image"), updateActivity);
router.delete("/:id", deleteActivity);

export default router;
