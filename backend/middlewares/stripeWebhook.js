import Stripe from "stripe";
import supabase from "../config/supabaseClient.js";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleInitialDeposit = async (event) => {
  const pi = event.data.object;
  const {
    id,
    user_id,
    check_in,
    check_out,
    accommodation_subtotal,
    sales_tax,
    tourist_tax,
    total_price,
    guests_over,
    guests_under,
    credit_fees,
  } = pi.metadata;
  try {
    // Retrieve full PaymentIntent with expanded charges to get billing info
    const fullPi = await stripe.paymentIntents.retrieve(pi.id, {
      expand: ["payment_method"],
    });

    const billing = fullPi.payment_method.billing_details;

    const reservationData = {
      id,
      user_id,
      start_date: check_in,
      end_date: check_out,
      accommodation_subtotal,
      sales_tax,
      tourist_tax,
      total_price: parseFloat(total_price),
      amount_paid: fullPi.amount_received / 100,
      guests_over,
      guests_under,
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
      credit_fees,
    };

    const { data: reservation, error } = await supabase
      .from("reservations")
      .insert([reservationData])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert failed:", error);
      return;
    }

    // Send email to admin
    await axios.post(`${process.env.BACKEND_URL}/email/initializeBooking`, {
      reservation_id: reservation.id,
    });

    // Send email to client
    await axios.post(`${process.env.BACKEND_URL}/email/confirmedBooking`, {
      reservation_id: reservation.id,
    });
  } catch (err) {
    console.error("Error processing payment:", err);
  }
};

const handleRemainBalance = async (event) => {
  const intent = event.data.object;
  const pi = event.data.object;
  const reservationId = intent.metadata.reservationId;

  const paymentAmount = intent.amount_received / 100;

  // Get the reservation
  const { data } = await supabase.from("reservations").select("*").eq("id", reservationId).single();

  // Increment the amount paid
  const updatedAmount = data.amount_paid + paymentAmount;

  // Create the new payment_intent array
  const payment_intent = [data.payment_intent[0], pi.id];

  // Update the database
  const { error: updateError } = await supabase
    .from("reservations")
    .update({ amount_paid: updatedAmount, status: "paid", payment_intent })
    .eq("id", reservationId);

  if (updateError) throw updateError;

  // Send email to admin
  await axios.post(`${process.env.BACKEND_URL}/email/paidBooking`, {
    reservation_id: reservationId,
  });

  // Send email to client
  await axios.post(`${process.env.BACKEND_URL}/email/confirmedBooking`, {
    reservation_id: reservationId,
  });
};

export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  res.json({ received: true });

  // After answering the response, process the request in the background
  setImmediate(async () => {
    try {
      if (event.type === "payment_intent.succeeded") {
        const intentType = event.data.object.metadata.type;

        if (intentType === "initialize_deposit") {
          await handleInitialDeposit(event);
        } else if (intentType === "remaining_balance") {
          await handleRemainBalance(event);
        }
      }
    } catch (err) {
      console.error("Background task error:", err);
    }
  });
};
