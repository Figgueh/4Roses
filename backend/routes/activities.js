import express from "express";
import {
  getActivities,
  getActivityIdByName,
  addActivity,
} from "../controllers/activityController.js";

const router = express.Router();

router.get("/", getActivities);
router.get("/:activityName", getActivityIdByName);
router.post("/", addActivity);

export default router;
