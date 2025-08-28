import express from "express";
import { getAmenities } from "../controllers/amenitiesController.js";

const router = express.Router();

router.get("/", getAmenities);

export default router;
