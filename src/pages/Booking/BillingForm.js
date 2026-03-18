import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Alert,
  AlertTitle,
} from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import StripeCheckout from "../../components/Billing/StripeCheckout";
import supabase from "connection/client";
import axios from "axios";
import Iban from "components/Billing/Iban";
import DefaultNavbar from "components/DefaultNavbar";
import { useTranslation } from "react-i18next";
import { routes } from "routes";

const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`);
const ONLINE_PAYMENT_FEE_RATE = 0.036; // 3.6%

export default function BillingForm() {
  const { state } = useLocation();
  const {
    dates = {},
    nights = 0,
    accommodation_subtotal = 0,
    sales_tax = 0,
    tourist_tax = 0,
    price = 0,
    dueToday = 0,
    guestsOver = 0,
    guestsUnder = 0,
  } = state || {};
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookingId, setBookingId] = useState("");
  const { t, i18n } = useTranslation();
  const translatedRoutes = routes(t);
  const [loading, setLoading] = useState(false);

  const [clientSecret, setClientSecret] = useState("");
  const guests = guestsOver + guestsUnder;
  const [creditPrice, setCreditPrice] = useState(price);
  const [creditDueToday, setCreditDueToday] = useState(dueToday);
  const fee = price * ONLINE_PAYMENT_FEE_RATE;

  const dateKeys = Object.keys(dates).sort();
  const checkIn = dateKeys[0];
  const checkOut = dateKeys[dateKeys.length - 1];

  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("success");
  const setError = (msg) => {
    setMessage(msg);
    setMessageSeverity("error");
  };
  const setSuccess = (msg) => {
    setMessage(msg);
    setMessageSeverity("success");
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    setBookingId(crypto.randomUUID());
  }, []);

  const [form, setForm] = useState({
    payment_method: "iban",
    billing_name: "",
    phone: "",
    billing_address: "",
    billing_state: "",
    billing_city: "",
    billing_postal_code: "",
    billing_country: "",
  });

  useEffect(() => {
    if (form.payment_method === "credit_card") {
      const newPriceWithFee = price + fee;
      const newDue = newPriceWithFee * 0.5;

      setCreditPrice(newPriceWithFee);
      setCreditDueToday(newDue);
    } else {
      setCreditPrice(price);
      setCreditDueToday(dueToday);
    }
  }, [form.payment_method, price, dueToday]);

  useEffect(() => {
    if (form.payment_method !== "credit_card") return;
    if (!user) return;

    const fetchClientSecret = async () => {
      setLoading(true);
      setMessage("");
      // If the credit price hasn't been updated it, then don't create the intent.
      if (price == creditPrice) return;

      try {
        const payload = {
          id: bookingId,
          user_id: user.id,
          check_in: checkIn,
          check_out: checkOut,
          accommodation_subtotal,
          sales_tax,
          tourist_tax,
          total_price: creditPrice,
          amount_paid: creditDueToday,
          payment_method: form.payment_method,
          guests_over: guestsOver,
          guests_under: guestsUnder,
          credit_fees: fee,
        };
        const { data } = await axios.post(
          `${process.env.REACT_APP_BACKEND}/billings/create-payment-intent`,
          {
            payload,
          }
        );

        console.log(payload.id);
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        setError(t("Failed to initialize credit card payment."));
      } finally {
        setLoading(false);
      }
    };

    fetchClientSecret();
  }, [
    form.payment_method,
    checkIn,
    checkOut,
    nights,
    creditPrice,
    creditDueToday,
    form.guests,
    form.billing_name,
    form.billing_address,
    form.billing_state,
    form.billing_postal_code,
    form.billing_country,
    user,
  ]);

  // Handle submit is when the user click on the submit button for IBAN payment requests.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError(t("You must be logged in to make a reservation"));
      return;
    }

    if (form.payment_method === "credit_card") {
      setError(t("Please use the payment form below"));
      return;
    }

    // Basic validation for IBAN path
    if (
      !form.billing_name ||
      !form.phone ||
      !form.billing_address ||
      !form.billing_country ||
      !form.billing_city ||
      !form.billing_state ||
      !form.billing_postal_code
    ) {
      console.log(form);
      setError(t("Please fill in all billing fields"));
      return;
    }

    const payload = {
      id: bookingId,
      user_id: user.id,
      start_date: checkIn,
      end_date: checkOut,
      accommodation_subtotal,
      sales_tax,
      tourist_tax,
      total_price: price,
      amount_paid: dueToday,
      payment_method: form.payment_method,
      guests_over: guestsOver,
      guests_under: guestsUnder,
      billing_name: form.billing_name,
      phone: form.phone,
      billing_address: form.billing_address,
      billing_country: form.billing_country,
      billing_city: form.billing_city,
      billing_state: form.billing_state,
      billing_postal_code: form.billing_postal_code,
    };

    try {
      setLoading(true);
      setMessage("");

      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND}/bookings/createReservation`,
        payload
      );

      if (data.success) {
        setSuccess(t("Reservation created! Please complete the bank transfer to confirm."));

        // Send email
        await axios.post(`${process.env.REACT_APP_BACKEND}/email/initializeBooking`, {
          reservation_id: data.reservation.id,
        });

        navigate("/booking-success", {
          state: { bookingId: data.reservation.id },
        });
      } else {
        setError(t("Failed to create reservation"));
      }
    } catch (err) {
      console.error(err);
      setError(t("Error creating reservation"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <>
      <DefaultNavbar routes={translatedRoutes} relative={true} />
      <MKBox
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={3}
        bgColor="#f5f5f5"
      >
        <MKBox width="100%" maxWidth="900px" p={4} borderRadius="2xl" bgColor="white" shadow="lg">
          <Grid container spacing={4}>
            {/* LEFT – Booking Summary */}
            <Grid item xs={12} md={6}>
              <MKTypography variant="h4" fontWeight="bold" mb={2}>
                {t("Booking Summary")}
              </MKTypography>

              <MKTypography variant="body1">
                <strong>{t("Dates")}:</strong> {checkIn} → {checkOut}
              </MKTypography>
              <MKTypography variant="body1">
                <strong>{t("Nights")}:</strong> {nights}
              </MKTypography>
              <MKTypography variant="body1">
                <strong>{t("Number of guests")}:</strong> {guests}
              </MKTypography>
              <MKTypography variant="body1">
                <strong>{t("Total")}:</strong> €{creditPrice.toFixed(2)}
              </MKTypography>
              <MKTypography variant="body1" color="success">
                <strong>{t("Due today")} (50%):</strong> €{creditDueToday.toFixed(2)}
              </MKTypography>
              {form.payment_method === "credit_card" && (
                <MKBox
                  mt={1}
                  mb={2}
                  p={2}
                  bgcolor="#fffbea"
                  borderRadius="md"
                  border="1px solid #ffe58f"
                >
                  <MKTypography variant="body2" color="warning">
                    {t("Online payment fee")}:{" "}
                    <strong>+{(ONLINE_PAYMENT_FEE_RATE * 100).toFixed(2)}%</strong>
                    <br />({t("Applied automatically to the total")})
                  </MKTypography>
                </MKBox>
              )}
              <MKTypography variant="body2" mt={2} color="secondary">
                {t("Remaining balance must be paid before check-in")}.
              </MKTypography>
            </Grid>

            {/* RIGHT – Payment Form */}
            <Grid item xs={12} md={6}>
              <MKTypography variant="h4" fontWeight="bold" mb={2}>
                {t("Payment")}
              </MKTypography>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {/* Online payment Methods */}
                <Grid item xs={12}>
                  <FormControl>
                    <RadioGroup
                      row
                      name="payment_method"
                      value={form.payment_method}
                      onChange={handleChange}
                    >
                      <FormControlLabel
                        value="iban"
                        control={<Radio />}
                        label={t("IBAN transfer")}
                      />
                      <FormControlLabel
                        value="credit_card"
                        control={<Radio />}
                        label={t("Online payment options")}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* IBAN */}
                {form.payment_method === "iban" && (
                  <Iban
                    form={form}
                    handleChange={handleChange}
                    booking={bookingId}
                    loading={loading}
                    handleSubmit={handleSubmit}
                  />
                )}

                {/* Stripe / Credit Card */}
                {form.payment_method === "credit_card" && (
                  <>
                    {clientSecret && (
                      <Grid item xs={12}>
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret,
                            locale: i18n.language,
                          }}
                        >
                          <StripeCheckout setMessage={setMessage} setLoading={setLoading} />
                        </Elements>
                      </Grid>
                    )}
                  </>
                )}

                {/* Message */}
                {message && (
                  <Alert
                    sx={{ mt: 2, mb: 2 }}
                    severity={messageSeverity}
                    onClose={() => {
                      setMessage(null);
                    }}
                  >
                    <AlertTitle>
                      {messageSeverity === "error" ? t("Billing issue") : t("Billing message")}
                    </AlertTitle>
                    {message}
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Grid>
        </MKBox>
      </MKBox>
    </>
  );
}
