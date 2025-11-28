import express from "express";
import {
  createPaymentIntent,
  createReservation,
  getIcs,
  getMonthlyPrice,
  // stripeWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/ics", getIcs);
router.get("/monthlyPrice", getMonthlyPrice);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/createReservation", createReservation);
// router.post("/stripeWebhook", stripeWebhook);

export default router;
