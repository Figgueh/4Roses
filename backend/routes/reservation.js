import express from "express";
import {
  checkReservation,
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
router.get("/check/:check_in/:check_out", checkReservation);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/createReservation", createReservation);

export default router;
