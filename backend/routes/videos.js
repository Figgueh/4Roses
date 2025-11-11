import express from "express";
import {
  addVideo,
  deleteVideosByIds,
  getDisplay,
  getVideos,
  reorderVideos,
  updateDisplayVideo,
} from "../controllers/videoController.js";

const router = express.Router();

router.get("/", getVideos);
router.get("/display", getDisplay);
router.put("/display/:id", updateDisplayVideo);
router.put("/reorder", reorderVideos);
router.post("/", addVideo);
router.post("/deleteMany", deleteVideosByIds);

export default router;
