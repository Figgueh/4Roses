import express from "express";
import {
  sendVerificationEmail,
  sendContactEmail,
  sendBookingInitializedEmail,
  sendBookingPaidEmail,
  sendBookingConfirmEmail,
  sendSecurityDepositSettledEmail,
  sendPasswordReset,
} from "../controllers/emailController.js";

const router = express.Router();

router.post("/sendEmailVerification", sendVerificationEmail);
router.post("/contact", sendContactEmail);
router.post("/initializeBooking", sendBookingInitializedEmail);
router.post("/paidBooking", sendBookingPaidEmail);
router.post("/confirmedBooking", sendBookingConfirmEmail);
router.post("/securityDepositSettled", sendSecurityDepositSettledEmail);
router.post("/passwordReset", sendPasswordReset);

export default router;
