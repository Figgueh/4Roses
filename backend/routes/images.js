import express from "express";
import { getImages, getLargestDisplayOrder, uploadImage } from "../controllers/imageController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getImages);
router.get("/largestDisplayOrder/:album", getLargestDisplayOrder);
router.post("/", upload.single("image"), uploadImage);

export default router;
