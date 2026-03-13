import express from "express";
import {
  getAboutImage,
  getAboutSections,
  updateAboutImage,
  updateAboutSection,
} from "../controllers/aboutController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAboutSections);
router.get("/aboutImage", getAboutImage);
router.put("/aboutImage", upload.single("image"), updateAboutImage);
router.put("/:id", updateAboutSection);

export default router;
