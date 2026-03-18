import express from "express";
import {
  sendBookingConfirmEmail,
  sendBookingInitializedEmail,
  sendBookingPaidEmail,
  sendContactEmail,
  sendSecurityDepositSettledEmail,
  sendVerificationEmail,
} from "../controllers/emailController.js";

const router = express.Router();

router.post("/sendEmailVerification", sendVerificationEmail);
router.post("/initializeBooking", sendBookingInitializedEmail);
router.post("/confirmedBooking", sendBookingConfirmEmail);
router.post("/paidBooking", sendBookingPaidEmail);
router.post("/securityDepositSettled", sendSecurityDepositSettledEmail);

router.post("/contact", sendContactEmail);

export default router;
