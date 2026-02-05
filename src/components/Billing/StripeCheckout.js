import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { useStripe, useElements, PaymentElement, AddressElement } from "@stripe/react-stripe-js";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

export default function StripeCheckout({ setMessage, setLoading }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const handleStripePay = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Payment system not ready. Refresh the page.");
      return;
    }

    setLoading(true);
    setMessage("");
    setSubmitted(true);

    try {
      // Confirm payment — Stripe will collect billing info from PaymentElement & AddressElement
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.REACT_APP_FRONTEND}/booking-success`,
        },
      });

      if (result.error) {
        setMessage("Error: Payment error: " + result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        setMessage("Payment successful!");
        console.log("PaymentIntent ID:", result.paymentIntent.id);
      } else if (result.paymentIntent?.status === "processing") {
        setMessage("Payment is processing. Please wait...");
      } else {
        setMessage("Payment status: " + result.paymentIntent?.status);
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setMessage("Error: Payment failed. Try again.");
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
            fields: { phone: "always" },
            validation: { phone: { required: "always" } },
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
};
