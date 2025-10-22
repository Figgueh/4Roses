import express from "express";
import {
  getImages,
  getImageData,
  getOrderedImages,
  getImageDataForAlbum,
  getLargestDisplayOrder,
  uploadImage,
  reorderImages,
  updateImageData,
  deleteImageById,
  deleteImagesByIds,
  getDisplayImages,
  updateDisplayImage,
  getDisplayImage,
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
router.get("/display/both", getDisplayImages);
router.get("/display/:album", getDisplayImage);
router.post("/", upload.single("image"), uploadImage);
router.put("/reorder", reorderImages);
router.put("/imageData/:id", updateImageData);
router.put("/display/:album/:id", updateDisplayImage);
router.delete("/:id", deleteImageById);
router.post("/deleteMany", deleteImagesByIds);

export default router;
