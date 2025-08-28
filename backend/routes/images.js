import express from "express";
import {
  getImages,
  getImageData,
  getOrderedImages,
  getImageDataForAlbum,
  getLargestDisplayOrder,
  uploadImage,
  reorderImages,
  deleteImageById,
  deleteImagesByIds,
} from "../controllers/imageController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getImages);
router.get("/imageData/:id", getImageData);
router.get("/:album", getOrderedImages);
router.get("/data/:album", getImageDataForAlbum);
router.get("/largestDisplayOrder/:album", getLargestDisplayOrder);
router.post("/", upload.single("image"), uploadImage);
router.put("/reorder", reorderImages);
router.delete("/:id", deleteImageById);
router.post("/deleteMany", deleteImagesByIds);

export default router;
