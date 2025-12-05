import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid, Radio, RadioGroup, FormControlLabel, FormControl, Divider } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import StripeCheckout from "../../components/Billing/StripeCheckout";
import supabase from "connection/client";
import axios from "axios";
import Iban from "components/Billing/Iban";

const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`);
const ONLINE_PAYMENT_FEE_RATE = 0.029; // 2.9%

export default function BillingForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    setBookingId(crypto.randomUUID());
  }, []);

  const {
    dates = {},
    nights = 0,
    price = 0,
    dueToday = 0,
    guestsOver = 0,
    guestsUnder = 0,
  } = state || {};
  const guests = guestsOver + guestsUnder;
  const [creditPrice, setCreditPrice] = useState(price);
  const [creditDueToday, setCreditDueToday] = useState(dueToday);

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
      const newPrice = price - 500;
      const fee = newPrice * ONLINE_PAYMENT_FEE_RATE;
      const newPriceWithFee = newPrice + fee;
      const newDue = newPriceWithFee * 0.5;

      setCreditPrice(newPriceWithFee);
      setCreditDueToday(newDue);
    } else {
      setCreditPrice(price);
      setCreditDueToday(dueToday);
    }
  }, [form.payment_method, price, dueToday]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const dateKeys = Object.keys(dates).sort();
  const checkIn = dateKeys[0];
  const checkOut = dateKeys[dateKeys.length - 1];

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (form.payment_method !== "credit_card") return;
    if (!user) return;

    const fetchClientSecret = async () => {
      setLoading(true);
      setMessage("");
      try {
        const payload = {
          user_id: user.id,
          check_in: checkIn,
          check_out: checkOut,
          nights,
          total_price: creditPrice,
          amount_paid: creditDueToday,
          payment_method: form.payment_method,
          guests_over: guestsOver,
          guests_under: guestsUnder,
        };
        const { data } = await axios.post(
          `${process.env.REACT_APP_BACKEND}/billings/create-payment-intent`,
          {
            payload,
          }
        );

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        setMessage("Error: Failed to initialize credit card payment.");
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
      setMessage("Error: You must be logged in to make a reservation");
      return;
    }

    if (form.payment_method === "credit_card") {
      setMessage("Error: Please use the payment form below");
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
      setMessage("Error: Please fill in all billing fields");
      return;
    }

    const payload = {
      id: bookingId,
      user_id: user.id,
      start_date: checkIn,
      end_date: checkOut,
      nights,
      payment_method: form.payment_method,
      total_price: price,
      amount_paid: dueToday,
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

      console.log(data);

      if (data.success) {
        setMessage("Reservation created! Please complete the bank transfer to confirm.");
        navigate("/booking-success", {
          state: { bookingId: data.reservation.id },
        });
      } else {
        setMessage("Error: Failed to create reservation");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error: Error creating reservation");
    } finally {
      setLoading(false);
    }
  };

  return (
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
              Booking Summary
            </MKTypography>

            <MKTypography variant="body1">
              <strong>Dates:</strong> {checkIn} → {checkOut}
            </MKTypography>
            <MKTypography variant="body1">
              <strong>Nights:</strong> {nights}
            </MKTypography>
            <MKTypography variant="body1">
              <strong>Number of guests:</strong> {guests}
            </MKTypography>
            <MKTypography variant="body1">
              <strong>Total:</strong> €{creditPrice.toFixed(2)}
            </MKTypography>
            <MKTypography variant="body1" color="success">
              <strong>Due today (50%):</strong> €{creditDueToday.toFixed(2)}
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
                  Online payment fee: <strong>+2.9%</strong>
                  <br />
                  (Applied automatically to the total)
                </MKTypography>
                <MKTypography variant="body2" color="warning" mt={2}>
                  The €500 security deposit is <strong>NOT charged today</strong> when paying by
                  credit card. It may be collected later if needed.
                </MKTypography>
              </MKBox>
            )}
            <MKTypography variant="body2" mt={2} color="secondary">
              Remaining balance must be paid before check-in.
            </MKTypography>
          </Grid>

          {/* RIGHT – Payment Form */}
          <Grid item xs={12} md={6}>
            <MKTypography variant="h4" fontWeight="bold" mb={2}>
              Payment
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
                    <FormControlLabel value="iban" control={<Radio />} label="IBAN transfer" />
                    <FormControlLabel
                      value="credit_card"
                      control={<Radio />}
                      label="Online payment options"
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
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripeCheckout setMessage={setMessage} setLoading={setLoading} />
                      </Elements>
                    </Grid>
                  )}
                </>
              )}

              {/* Message */}
              {message && (
                <Grid item xs={12}>
                  <MKTypography
                    textAlign="center"
                    fontSize="0.9rem"
                    color={!message.includes("Error") ? "success" : "error"}
                  >
                    {message}
                  </MKTypography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </MKBox>
    </MKBox>
  );
}
