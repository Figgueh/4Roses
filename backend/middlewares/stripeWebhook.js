import Stripe from "stripe";
import supabase from "../config/supabaseClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("📨 Event type:", event.type);

  if (event.type === "payment_intent.succeeded") {
    try {
      const pi = event.data.object;
      console.log("💰 PAYMENT SUCCESS:", pi.id);
      console.log("📊 Metadata:", pi.metadata);

      const { user_id, check_in, check_out, total_price, guests } = pi.metadata;

      // Skip if this is a test/empty metadata event
      if (!user_id) {
        console.log("ℹ️ Skipping event - no user_id in metadata (likely a test event)");
        return res.json({ received: true });
      }

      // Get billing from charges
      let billing = {};
      if (pi.charges?.data?.[0]?.billing_details) {
        billing = pi.charges.data[0].billing_details;
      }

      const reservationData = {
        user_id,
        start_date: check_in,
        end_date: check_out,
        number_of_guests: parseInt(guests) || 1,
        total_price: parseFloat(total_price),
        deposit_paid: pi.amount_received / 100,
        payment_method: "credit_card",
        billing_name: billing.name || "Online Payment",
        billing_street: billing.address?.line1 || "",
        billing_city: billing.address?.city || "",
        billing_postal_code: billing.address?.postal_code || "",
        billing_state: billing.address?.state || "",
        billing_country: billing.address?.country || "",
        phone: billing.phone || "",
        stripe_payment_intent_id: pi.id,
        status: "confirmed",
      };

      console.log("📝 Inserting reservation:", reservationData);

      const { error } = await supabase.from("reservations").insert([reservationData]);

      if (error) {
        console.error("❌ Supabase insert failed:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log("✅ Reservation stored successfully");
      res.json({ received: true });
    } catch (err) {
      console.error("❌ Error processing payment:", err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.json({ received: true });
  }
};
