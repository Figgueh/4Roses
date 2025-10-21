import express from "express";
import { welcome } from "../controllers/homeController.js";

const router = express.Router();
router.get("/", welcome);
export default router;
