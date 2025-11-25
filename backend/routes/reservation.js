import express from "express";
import { getIcs, getPrice } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/ics", getIcs);
router.get("/price", getPrice);

export default router;
