import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
import axios from "axios";

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

  useEffect(() => {
    if (!bookingId && !urlPaymentIntent) {
      setError("No booking ID or payment intent found.");
      setLoading(false);
      return;
    }

    const idToLookup = bookingId || urlPaymentIntent;

    const fetchBooking = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND}/reservation/booking/${idToLookup}`
        );
        setBooking(data.booking);
      } catch (err) {
        console.error(err);
        setError("Failed to load booking information.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleBackToHome = () => navigate("/");

  if (loading) {
    return (
      <MKBox minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
        <MKTypography>Loading booking details...</MKTypography>
      </MKBox>
    );
  }

  if (error) {
    return (
      <MKBox minHeight="100vh" display="flex" justifyContent="center" alignItems="center">
        <MKTypography color="error">{error}</MKTypography>
        <MKButton onClick={handleBackToHome} sx={{ mt: 2 }}>
          Back to Home
        </MKButton>
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
            ? "Your booking is in the process of being confirmed."
            : "Booking Confirmed!"}
        </MKTypography>

        {status === "pending" ? (
          <MKTypography variant="body2">
            We`ve notified the owner to confirm your deposit. Once it`s verified, you`ll receive a
            confirmation email at:{" "}
            <MKTypography component="span" fontWeight="bold">
              {email}
            </MKTypography>
            . Thank you for your patience!
          </MKTypography>
        ) : (
          <MKTypography variant="body2">
            Your booking is confirmed. We look forward to hosting you!
          </MKTypography>
        )}

        <Grid container spacing={1} mb={2} mt={1}>
          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Check-in:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{start_date}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Check-out:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{end_date}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Total Price:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">€{total_price?.toFixed(2)}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Amount Paid:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">€{amount_paid?.toFixed(2)}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Payment Method:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{payment_method}</MKTypography>
          </Grid>
        </Grid>

        {billing_address && (
          <MKBox mt={2} p={2} bgcolor="#f1f1f1" borderRadius="md">
            <MKTypography variant="body2" fontWeight="bold" mb={1}>
              Billing Address
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
              This booking is currently pending. You can view it in your dashboard, where you can
              also make any necessary updates or changes.
            </MKTypography>
          </MKBox>
        )}

        <MKButton fullWidth color="dark" sx={{ mt: 3 }} onClick={handleBackToHome}>
          Back to Home
        </MKButton>
      </MKBox>
    </MKBox>
  );
}
