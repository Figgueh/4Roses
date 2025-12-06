import express from "express";
import {
  continuePaymentIntent,
  createPaymentIntent,
  generatePDF,
  getMonthlyPrice,
  updateMonthlyPrice,
} from "../controllers/billingController.js";

const router = express.Router();

router.get("/monthlyPrice", getMonthlyPrice);
router.put("/monthlyPrice", updateMonthlyPrice);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/:id/continue-payment-intent", continuePaymentIntent);
router.get("/:id/invoice", generatePDF);

export default router;
