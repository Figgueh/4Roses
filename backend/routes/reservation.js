import express from "express";
import { getIcs, getMonthlyPrice } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/ics", getIcs);
router.get("/monthlyPrice", getMonthlyPrice);

export default router;
