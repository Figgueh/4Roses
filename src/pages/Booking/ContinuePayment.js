import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import { CircularProgress, Card, Grid } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeCheckout from "../../components/Billing/StripeCheckout";
import Iban from "components/Billing/Iban";
import { useTranslation } from "react-i18next";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export default function ContinuePayment() {
  const { id } = useParams();

  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/bookings/booking/${id}`);

        setBooking(data.booking);
        console.log(data.booking);
        const remaining = data.total_price - data.amount_paid;
        if (remaining <= 0) {
          setError(t("This booking is already fully paid."));
          return;
        }

        if (data.booking.payment_method === "credit card") {
          const intentRes = await axios.post(
            `${process.env.REACT_APP_BACKEND}/billings/${id}/continue-payment-intent`
          );

          setClientSecret(intentRes.data.clientSecret);
        }
      } catch (err) {
        console.error(err);
        setError(t("Failed to load booking or create payment intent."));
      }
    };

    loadBooking();
  }, [id]);

  if (error)
    return (
      <MKBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Card sx={{ p: 3, maxWidth: 450 }}>
          <MKTypography color="error" textAlign="center">
            {error}
          </MKTypography>
        </Card>
      </MKBox>
    );

  if (!booking)
    return (
      <MKBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </MKBox>
    );

  return (
    <MKBox display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={2}>
      <Card sx={{ p: 4, maxWidth: 500, width: "100%", boxShadow: 6 }}>
        <MKTypography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
          {t("Pay Remaining Balance")}
        </MKTypography>

        <MKTypography textAlign="center" mb={1}>
          {t("Booking ID:")} {booking.id}
        </MKTypography>

        <MKTypography textAlign="center" mb={3}>
          {t("Remaining Amount")}: €{(booking.total_price - booking.amount_paid).toFixed(2)}
        </MKTypography>

        {/* CREDIT CARD PAYMENT */}
        {booking.payment_method === "credit card" && clientSecret ? (
          <Grid item xs={12}>
            <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
              <StripeCheckout setMessage={setMessage} setLoading={() => {}} />
            </Elements>
          </Grid>
        ) : booking.payment_method === "credit card" ? (
          <CircularProgress />
        ) : null}

        {/* IBAN PAYMENT */}
        {booking.payment_method === "iban" && <Iban booking={booking.id} />}

        {/* MESSAGE */}
        {message && (
          <Grid item xs={12} mt={2}>
            <MKTypography
              textAlign="center"
              fontSize="0.9rem"
              color={!message.includes("Error") ? "success" : "error"}
            >
              {message}
            </MKTypography>
          </Grid>
        )}
      </Card>
    </MKBox>
  );
}
