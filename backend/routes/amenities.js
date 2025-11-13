import express from "express";
import {
  getAllAmenities,
  getAmenities,
  addAmenity,
  updateAmenity,
  deleteAmenity,
  getCountOfAllAmenities,
} from "../controllers/amenitiesController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getAllAmenities);
router.get("/count", getCountOfAllAmenities);
router.get("/:type", getAmenities);
router.post("/", upload.single("image"), addAmenity);
router.put("/:id", upload.single("image"), updateAmenity);
router.delete("/:id", deleteAmenity);

export default router;
