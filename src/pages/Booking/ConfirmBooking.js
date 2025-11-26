import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid, Radio, RadioGroup, FormControlLabel, FormControl, Divider } from "@mui/material";

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKInput from "components/MKInput";
import MKButton from "components/MKButton";

export default function ConfirmBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Redirect if accessed without data
  useEffect(() => {
    if (!state?.dates || !state?.nights || !state?.price) {
      navigate("/availability");
    }
  }, [state, navigate]);

  const { dates = {}, nights = 0, price = 0, dueToday = 0 } = state || {};

  const [form, setForm] = useState({
    guests: 1,
    payment_method: "iban",
    card_last4: "",
    iban: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get first and last dates
  const dateKeys = Object.keys(dates).sort();
  const checkIn = dateKeys[0];
  const checkOut = dateKeys[dateKeys.length - 1];

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const IBAN_ACCOUNT = "DE89 3704 0044 0532 0130 00";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const user_id = "USER_UUID_HERE"; // replace with supabase auth

    const payload = {
      user_id,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      total_price: price,
      amount_paid: dueToday,
      ...form,
    };

    try {
      const res = await fetch("http://localhost:4000/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Booking failed");

      setMessage("✅ Booking confirmed successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not confirm booking. Try again.");
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
          {/* LEFT – BOOKING SUMMARY */}
          <Grid item xs={12} md={6}>
            <MKTypography variant="h4" fontWeight="bold" mb={1}>
              Booking Summary
            </MKTypography>

            <Divider sx={{ mb: 2 }} />

            <MKTypography variant="body1" mb={1}>
              <strong>Dates: </strong>
              {checkIn} → {checkOut}
            </MKTypography>

            <MKTypography variant="body1" mb={1}>
              <strong>Nights: </strong>
              {nights}
            </MKTypography>

            <MKTypography variant="body1" mb={1}>
              <strong>Total: </strong>€
              {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </MKTypography>

            <MKTypography variant="body1" color="success.main" mb={1}>
              <strong>Due Today (50%): </strong>€
              {dueToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </MKTypography>

            <MKTypography variant="body2" color="text.secondary" mt={2}>
              The remaining balance must be paid before check-in.
            </MKTypography>
          </Grid>

          {/* RIGHT – PAYMENT FORM */}
          <Grid item xs={12} md={6}>
            <MKTypography variant="h4" fontWeight="bold" mb={1}>
              Payment
            </MKTypography>

            <MKTypography variant="body2" color="text.secondary" mb={2}>
              Choose your payment method
            </MKTypography>

            <Divider sx={{ mb: 3 }} />

            <MKBox component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MKInput
                    type="number"
                    label="Guests"
                    name="guests"
                    inputProps={{ min: 1 }}
                    value={form.guests}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>

                {/* PAYMENT METHOD */}
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
                        label="Credit card"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* IBAN */}
                {form.payment_method === "iban" && (
                  <Grid item xs={12}>
                    <MKBox mt={2} p={2} bgcolor="#f1f1f1" borderRadius={1}>
                      <MKTypography variant="body2">
                        Please transfer the due today price in <strong>euros (€)</strong> to the
                        following IBAN account:
                      </MKTypography>
                      <MKTypography variant="body1" fontWeight="bold" mt={1}>
                        {IBAN_ACCOUNT}
                      </MKTypography>
                      <MKTypography variant="body2" mt={1} color="text.secondary">
                        Once we receive your payment, you will receive a confirmation email with
                        your booking details.
                      </MKTypography>
                      <MKTypography variant="body2" mt={1} color="text.secondary">
                        Please allow up to 24 hours for your payment to be processed and the booking
                        to be confirmed.
                      </MKTypography>
                    </MKBox>
                  </Grid>
                )}

                {/* CREDIT CARD */}
                {form.payment_method === "credit_card" && (
                  <Grid item xs={12}>
                    <MKInput
                      label="Card last 4 digits"
                      name="card_last4"
                      value={form.card_last4}
                      onChange={handleChange}
                      inputProps={{ maxLength: 4 }}
                      fullWidth
                      required
                    />
                  </Grid>
                )}

                <Grid item xs={12} mt={2}>
                  <MKButton type="submit" fullWidth color="dark" size="large" disabled={loading}>
                    {loading ? "Processing..." : "Confirm Booking"}
                  </MKButton>
                </Grid>

                {message && (
                  <Grid item xs={12}>
                    <MKTypography
                      mt={1}
                      textAlign="center"
                      fontSize="0.9rem"
                      color={message.includes("✅") ? "success" : "error"}
                    >
                      {message}
                    </MKTypography>
                  </Grid>
                )}
              </Grid>
            </MKBox>
          </Grid>
        </Grid>
      </MKBox>
    </MKBox>
  );
}
