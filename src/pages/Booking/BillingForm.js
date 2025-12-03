import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid, Radio, RadioGroup, FormControlLabel, FormControl, Divider } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import StripeCheckout from "./StripeCheckout";
import supabase from "connection/client";
import axios from "axios";
import MKButton from "components/MKButton";
import AddressForm from "./AddressForm";

const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`);
const IBAN_ACCOUNT = "DE89 3704 0044 0532 0130 00";

export default function BillingForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const { dates = {}, nights = 0, price = 0, dueToday = 0, guests = 0 } = state || {};

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
          total_price: price,
          amount_paid: dueToday,
          payment_method: form.payment_method,
          guests: guests,
        };
        const { data } = await axios.post(
          `${process.env.REACT_APP_BACKEND}/reservation/create-payment-intent`,
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
    price,
    dueToday,
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
      user_id: user.id,
      start_date: checkIn,
      end_date: checkOut,
      nights,
      payment_method: form.payment_method,
      total_price: price,
      amount_paid: dueToday,
      number_of_guests: guests,
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
        `${process.env.REACT_APP_BACKEND}/reservation/createReservation`,
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
              <strong>Total:</strong> €{price.toFixed(2)}
            </MKTypography>
            <MKTypography variant="body1" color="success">
              <strong>Due today (50%):</strong> €{dueToday.toFixed(2)}
            </MKTypography>
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
                <>
                  <AddressForm form={form} handleChange={handleChange} />
                  <Grid item xs={12}>
                    <MKBox p={2} bgcolor="#f1f1f1" borderRadius="md">
                      <MKTypography variant="body2">
                        Transfer the deposit in <strong>euros (€)</strong> to:
                      </MKTypography>
                      <MKTypography fontWeight="bold" mt={1}>
                        {IBAN_ACCOUNT}
                      </MKTypography>
                      <MKTypography variant="body2" mt={1}>
                        Use this email as reference:
                      </MKTypography>
                      <MKTypography fontWeight="bold">joefigueiras@gmail.com</MKTypography>
                      <MKTypography variant="body2" mt={1} color="secondary">
                        You will receive a confirmation email once payment is received.
                      </MKTypography>
                      <MKTypography variant="body2" mt={1} color="secondary">
                        Please allow up to 24 hours for confirmation.
                      </MKTypography>
                    </MKBox>
                    <MKButton onClick={handleSubmit} fullWidth color="dark" disabled={loading}>
                      {loading ? "Processing..." : "Create reservation"}
                    </MKButton>
                  </Grid>
                </>
              )}

              {/* Stripe / Credit Card */}
              {form.payment_method === "credit_card" && clientSecret && (
                <Grid item xs={12}>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripeCheckout setMessage={setMessage} setLoading={setLoading} />
                  </Elements>
                </Grid>
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
