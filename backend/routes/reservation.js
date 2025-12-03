import express from "express";
import {
  checkReservation,
  createPaymentIntent,
  createReservation,
  generateCalendar,
  generatePDF,
  getAllReservations,
  getIcs,
  getMonthlyPrice,
  getReservationData,
  getUserReservations,
  refundSecurity,
  updateMonthlyPrice,
  updateReservation,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/ics", getIcs);
router.get("/monthlyPrice", getMonthlyPrice);
router.get("/booking/:id", getReservationData);
router.get("/check/:check_in/:check_out", checkReservation);
router.get("/calendar.ics", generateCalendar);
router.get("/user/:userId", getUserReservations);
router.get("/", getAllReservations);
router.put("/monthlyPrice/:month", updateMonthlyPrice);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/createReservation", createReservation);
router.get("/:id/invoice", generatePDF);
router.put("/:id", updateReservation);
router.post("/:id/refund-security", refundSecurity);

export default router;
