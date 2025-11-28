import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { useStripe, useElements, PaymentElement, AddressElement } from "@stripe/react-stripe-js";
import axios from "axios";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

export default function StripeCheckout({ setMessage, setLoading, bookingData }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const handleStripePay = async (e) => {
    e.preventDefault();
    console.log("✅ Form submitted");

    if (!stripe || !elements) {
      console.error("❌ Stripe or elements not ready");
      setMessage("❌ Payment system not ready. Refresh the page.");
      return;
    }

    setLoading(true);
    setMessage("");
    setSubmitted(true);

    try {
      console.log("🔄 Confirming payment with Stripe...");
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      console.log("📦 Payment result:", result);

      if (result.error) {
        console.error("❌ Stripe error:", result.error.message);
        setMessage("❌ " + result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        console.log("✅ Payment succeeded! Intent ID:", result.paymentIntent.id);

        // Get billing details from AddressElement
        const addressValue = await elements.getElement("address").getValue();
        const billing = addressValue?.value || {};

        // Create reservation immediately (don't wait for webhook)
        try {
          console.log("📝 Creating reservation...");
          const reservationPayload = {
            user_id: bookingData.user_id,
            start_date: bookingData.check_in,
            end_date: bookingData.check_out,
            total_price: bookingData.total_price,
            deposit_paid: bookingData.amount_paid,
            payment_method: "credit_card",
            number_of_guests: bookingData.guests,

            billing_name: billing.name || "",
            phone: billing.phone || "",
            billing_street: billing.address?.line1 || "",
            billing_city: billing.address?.city || "",
            billing_postal_code: billing.address?.postal_code || "",
            billing_state: billing.address?.state || "",
            billing_country: billing.address?.country || "",

            stripe_payment_intent_id: result.paymentIntent.id,
            status: "confirmed",
          };

          const { data } = await axios.post(
            `${process.env.REACT_APP_BACKEND}/reservation/createReservation`,
            reservationPayload
          );

          if (data.success) {
            console.log("✅ Reservation created successfully");
            setMessage("✅ Deposit successful! Check your email for confirmation.");
          } else {
            console.warn("⚠️ Reservation creation returned false");
            setMessage("✅ Payment received! Reservation may need confirmation.");
          }
        } catch (err) {
          console.error("❌ Reservation creation failed:", err);
          setMessage("✅ Payment received! Please contact support to confirm your reservation.");
        }
      } else if (result.paymentIntent?.status === "processing") {
        console.log("⏳ Payment processing. Intent ID:", result.paymentIntent.id);
        setMessage("⏳ Payment is processing. Please wait...");
      } else {
        console.log("⚠️ Unexpected status:", result.paymentIntent?.status);
        setMessage("⚠️ Payment status: " + result.paymentIntent?.status);
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      setMessage("❌ Payment failed. Try again.");
    } finally {
      setLoading(false);
      setSubmitted(false);
    }
  };

  return (
    <MKBox component="form" onSubmit={handleStripePay} ref={formRef}>
      <MKTypography variant="body2" mb={1}>
        Enter your payment details:
      </MKTypography>

      <MKBox p={2} border="1px solid #ddd" borderRadius="md" mb={2}>
        <AddressElement
          options={{
            mode: "billing",
            fields: {
              phone: "always",
            },
          }}
        />
        <PaymentElement />
      </MKBox>

      <MKButton type="submit" fullWidth color="dark" disabled={!stripe || submitted || !elements}>
        {submitted ? "Processing..." : "Pay Deposit"}
      </MKButton>
    </MKBox>
  );
}

StripeCheckout.propTypes = {
  setMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  bookingData: PropTypes.object.isRequired,
};
