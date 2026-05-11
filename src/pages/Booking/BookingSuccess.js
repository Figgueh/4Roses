import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
import { useTranslation } from "react-i18next";
import axios from "axios";
import LoadingScreen from "components/Loading/LoadingScreen";
import { HashLink } from "react-router-hash-link";

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const bookingId = state?.bookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const urlPaymentIntent = params.get("payment_intent");
  const { t } = useTranslation();

  useEffect(() => {
    if (!bookingId && !urlPaymentIntent) {
      setError(t("No booking ID or payment intent found."));
      setLoading(false);
      return;
    }

    const idToLookup = bookingId || urlPaymentIntent;

    const fetchBooking = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND}/bookings/booking/${idToLookup}`
        );
        setBooking(data.booking);
      } catch (err) {
        console.error(err);
        setError(t("Failed to load booking information."));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, urlPaymentIntent]);

  const handleBackToHome = () => navigate("/");

  if (loading) {
    return <LoadingScreen message={t("Loading booking details")} />;
  }

  if (error) {
    return (
      <MKBox
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={3}
        sx={{ background: "linear-gradient(160deg, #fdf8f3 0%, #f5ede0 100%)" }}
      >
        <MKBox
          width="100%"
          maxWidth="520px"
          p={{ xs: 3, sm: 5 }}
          borderRadius="2xl"
          bgColor="white"
          shadow="lg"
          sx={{ textAlign: "center" }}
        >
          {/* Icon */}
          <MKBox
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#fff8f0",
              border: "2px solid #e8c4a8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              fontSize: "2rem",
            }}
          >
            ⚠️
          </MKBox>

          <MKTypography
            variant="h4"
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              color: "#1e1612",
              mb: 1,
            }}
          >
            {t("We couldn't load your booking")}
          </MKTypography>

          <MKTypography variant="body2" sx={{ color: "#9e8a80", mb: 3, lineHeight: 1.7 }}>
            {t(
              "There was a problem retrieving your booking details. Your card was not charged. Please contact us if the issue persists."
            )}
          </MKTypography>

          <MKButton
            fullWidth
            onClick={handleBackToHome}
            sx={{
              background: "#8b4513",
              color: "#fff",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1rem",
              letterSpacing: "0.04em",
              py: 1.5,
              borderRadius: 2,
              "&:hover": { background: "#7a3c10" },
            }}
          >
            {t("Back to Home")}
          </MKButton>

          <MKTypography
            component={HashLink}
            to={`/AboutUs/#contactUs`}
            variant="caption"
            sx={{ color: "#b0978a", mt: 2, display: "block", cursor: "pointer" }}
          >
            {t("Need help? Contact us and we'll sort it out.")}
          </MKTypography>
        </MKBox>
      </MKBox>
    );
  }

  const {
    start_date,
    end_date,
    total_price,
    amount_paid,
    payment_method,
    status,
    email,
    billing_name,
    billing_address,
    billing_city,
    billing_state,
    billing_postal_code,
    billing_country,
  } = booking || {};

  return (
    <MKBox
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={3}
      bgColor="#f5f5f5"
    >
      <MKBox width="100%" maxWidth="600px" p={4} borderRadius="2xl" bgColor="white" shadow="lg">
        <MKTypography variant="h3" fontWeight="bold" mb={3} textAlign="center">
          {status == "pending"
            ? t("Your booking is in the process of being confirmed.")
            : t("Booking Confirmed!")}
        </MKTypography>

        {status === "pending" ? (
          <MKTypography variant="body2">
            {t(
              "We`ve notified the owner to confirm your deposit. Once it`s verified, you`ll receive a confirmation email at:"
            )}{" "}
            <MKTypography component="span" fontWeight="bold">
              {email}
            </MKTypography>
            . {t("Thank you for your patience!")}
          </MKTypography>
        ) : (
          <MKTypography variant="body2">
            {t("Your booking is confirmed. We look forward to hosting you!")}
          </MKTypography>
        )}

        <Grid container spacing={1} mb={2} mt={1}>
          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              {t("Check-in")}:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{start_date}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              {t("Check-out")}:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{end_date}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              {t("Total Price")}:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">€{total_price?.toFixed(2)}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              {t("Amount Paid")}:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">€{amount_paid?.toFixed(2)}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              {t("Payment Method")}:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{payment_method}</MKTypography>
          </Grid>
        </Grid>

        {billing_address && (
          <MKBox mt={2} p={2} bgcolor="#f1f1f1" borderRadius="md">
            <MKTypography variant="body2" fontWeight="bold" mb={1}>
              {t("Billing Address")}
            </MKTypography>
            <MKTypography variant="body2">{billing_name}</MKTypography>
            <MKTypography variant="body2">{billing_address}</MKTypography>
            <MKTypography variant="body2">
              {billing_city}, {billing_state} {billing_postal_code}
            </MKTypography>
            <MKTypography variant="body2">{billing_country}</MKTypography>
          </MKBox>
        )}

        {status === "pending" && (
          <MKBox mt={3} p={3} bgcolor="#fff3cd" borderRadius="md" border="1px solid #ffeeba">
            <MKTypography variant="body2" mb={2}>
              {t(
                "Your booking is currently pending. You can view it anytime in your dashboard, where you can cancel it or monitor its status."
              )}
            </MKTypography>
          </MKBox>
        )}

        <MKButton fullWidth color="dark" sx={{ mt: 3 }} onClick={handleBackToHome}>
          {t("Back to Home")}
        </MKButton>
      </MKBox>
    </MKBox>
  );
}
