import express from "express";
import {
  getActivities,
  getActivityIdByName,
  addActivity,
  updateActivity,
  deleteActivity,
  getActivityTranslation,
  getActivityById,
} from "../controllers/activityController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getActivities);
router.get("/data/:id", getActivityById);
router.get("/translation/:id", getActivityTranslation);
router.get("/:activityName", getActivityIdByName);
router.post("/", upload.single("image"), addActivity);
router.put("/:id", upload.single("image"), updateActivity);
router.delete("/:id", deleteActivity);

export default router;
