import Stripe from "stripe";
import supabase from "../config/supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    try {
      const pi = event.data.object;

      // Retrieve full PaymentIntent with expanded charges to get billing info
      const fullPi = await stripe.paymentIntents.retrieve(pi.id, {
        expand: ["payment_method"],
      });

      const billing = fullPi.payment_method.billing_details;

      const { user_id, check_in, check_out, total_price, guests } = pi.metadata;

      const reservationData = {
        user_id,
        start_date: check_in,
        end_date: check_out,
        number_of_guests: parseInt(guests) || 1,
        total_price: parseFloat(total_price),
        amount_paid: fullPi.amount_received / 100,
        payment_method: "credit_card",
        billing_name: billing.name,
        billing_address: billing.address?.line1,
        billing_city: billing.address?.city,
        billing_postal_code: billing.address?.postal_code,
        billing_state: billing.address?.state,
        billing_country: billing.address?.country,
        phone: billing.phone,
        status: "confirmed",
      };

      const { error } = await supabase.from("reservations").insert([reservationData]);

      if (error) {
        console.error("Supabase insert failed:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log("Reservation stored successfully from webhook");
      res.json({ received: true });
    } catch (err) {
      console.error("Error processing payment:", err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.json({ received: true });
  }
};
