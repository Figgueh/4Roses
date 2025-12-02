import express from "express";
import {
  checkReservation,
  createPaymentIntent,
  createReservation,
  generatePDF,
  getAllReservations,
  getIcs,
  getMonthlyPrice,
  getReservationData,
  refundSecurity,
  updateMonthlyPrice,
  updateReservation,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/ics", getIcs);
router.get("/monthlyPrice", getMonthlyPrice);
router.get("/booking/:id", getReservationData);
router.get("/check/:check_in/:check_out", checkReservation);
router.get("/:id/invoice", generatePDF);
router.get("/", getAllReservations);
router.put("/monthlyPrice/:month", updateMonthlyPrice);
router.put("/:id", updateReservation);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/createReservation", createReservation);
router.post("/:id/refund-security", refundSecurity);

export default router;
