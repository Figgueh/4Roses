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

  const pi = event.data.object;
  const { user_id, check_in, check_out, total_price, guests_over, guests_under } = pi.metadata;

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;

    // Check if we are paying off the remaining balance.
    if (intent.metadata?.type === "remaining_balance") {
      const reservationId = intent.metadata.reservationId;

      const paymentAmount = intent.amount_received / 100;

      // Get the reservation
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", reservationId)
        .single();

      // Increment the amount paid
      const updatedAmount = data.amount_paid + paymentAmount;

      // Update the database
      const { error: updateError } = await supabase
        .from("reservations")
        .update({ amount_paid: updatedAmount })
        .eq("id", reservationId);

      if (updateError) throw updateError;

      // If there is not more remaining balance
      if (updatedAmount >= data.total_price) {
        // Mark as completed in the database
        const { error: updateError } = await supabase
          .from("reservations")
          .update({ status: "completed" })
          .eq("id", reservationId);

        if (updateError) throw updateError;
      }

      res.json({ received: true });
      // If not then we initialize the reservation.
    } else {
      try {
        // Retrieve full PaymentIntent with expanded charges to get billing info
        const fullPi = await stripe.paymentIntents.retrieve(pi.id, {
          expand: ["payment_method"],
        });

        const billing = fullPi.payment_method.billing_details;

        const reservationData = {
          user_id,
          start_date: check_in,
          end_date: check_out,
          guests_over,
          guests_under,
          total_price: parseFloat(total_price),
          amount_paid: fullPi.amount_received / 100,
          payment_method: "credit card",
          billing_name: billing.name,
          billing_address: billing.address?.line1,
          billing_city: billing.address?.city,
          billing_postal_code: billing.address?.postal_code,
          billing_state: billing.address?.state,
          billing_country: billing.address?.country,
          phone: billing.phone,
          status: "confirmed",
          payment_intent: [pi.id],
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
    }
  } else {
    res.json({ received: true });
  }
};
