import express from "express";
import { getAboutSections, updateAboutSection } from "../controllers/aboutController.js";

const router = express.Router();

router.get("/", getAboutSections);
router.put("/:id", updateAboutSection);

export default router;
