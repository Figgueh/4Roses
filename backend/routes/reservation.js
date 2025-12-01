import express from "express";
import {
  createPaymentIntent,
  createReservation,
  getIcs,
  getMonthlyPrice,
  getReservationData,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/ics", getIcs);
router.get("/monthlyPrice", getMonthlyPrice);
router.get("/booking/:id", getReservationData);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/createReservation", createReservation);

export default router;
