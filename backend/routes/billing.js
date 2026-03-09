import express from "express";
import {
  addPriceOverride,
  continuePaymentIntent,
  createPaymentIntent,
  deletePriceOverride,
  generatePDF,
  getMonthlyPrice,
  getPriceOverrides,
  updateMonthlyPrice,
} from "../controllers/billingController.js";

const router = express.Router();

router.get("/monthlyPrice", getMonthlyPrice);
router.put("/monthlyPrice", updateMonthlyPrice);
router.post("/create-payment-intent", createPaymentIntent);
router.get("/priceOverrides", getPriceOverrides);
router.post("/priceOverrides", addPriceOverride);
router.delete("/priceOverrides/:id", deletePriceOverride);
router.post("/:id/continue-payment-intent", continuePaymentIntent);
router.get("/:id/invoice", generatePDF);

export default router;
