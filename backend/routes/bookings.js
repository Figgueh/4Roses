import express from "express";
import {
  checkReservation,
  createReservation,
  deleteReservation,
  generateCalendar,
  getAllReservations,
  getIcs,
  getReservationData,
  getUserReservations,
  settleSecurityDeposit,
  updateReservation,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/ics", getIcs);
router.get("/booking/:id", getReservationData);
router.get("/check/:check_in/:check_out", checkReservation);
router.get("/calendar.ics", generateCalendar);
router.get("/user/:userId", getUserReservations);
router.get("/", getAllReservations);
router.post("/createReservation", createReservation);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);
router.post("/:id/settleSecurityDeposit", settleSecurityDeposit);

export default router;
