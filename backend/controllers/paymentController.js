import supabase from "../config/supabaseClient.js";
import Stripe from "stripe";
// import bodyParser from "body-parser";

// GET all ICS for calendar
// /ics
export const getIcs = async (req, res, next) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Missing URL parameter");
  }

  try {
    const response = await fetch(url);
    const data = await response.text();

    res.set("Content-Type", "text/calendar");
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching ICS");
    next(err);
  }
};

// GET price for all months
//
export const getMonthlyPrice = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("monthly_pricing")
      .select("month, price")
      .order("month", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to load monthly prices" });
    }

    // Convert to useful format: {0: 120, 1: 130, ...}
    const monthlyPrices = {};

    data.forEach((row) => {
      monthlyPrices[row.month] = row.price;
    });

    return res.json(monthlyPrices);
  } catch (err) {
    console.error("PRICE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const createReservation = async (req, res) => {
  try {
    const {
      user_id,
      start_date,
      end_date,
      total_price,
      deposit_paid,
      number_of_guests,
      payment_method,

      phone,
      billing_address,
      billing_city,
      billing_postal_code,
      billing_country,
    } = req.body;

    if (
      !user_id ||
      !start_date ||
      !end_date ||
      !deposit_paid ||
      !phone ||
      !billing_address ||
      !billing_city ||
      !billing_postal_code ||
      !billing_country
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["iban", "credit_card"].includes(payment_method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const { data: existing } = await supabase
      .from("reservations")
      .select("id")
      .or(`start_date.lte.${end_date},end_date.gte.${start_date}`)
      .limit(1);

    if (existing?.length > 0) {
      return res.status(409).json({ error: "Dates already booked" });
    }

    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id,
          start_date,
          end_date,
          total_price,
          deposit_paid,
          payment_method,
          number_of_guests,
          phone,
          billing_address,
          billing_city,
          billing_postal_code,
          billing_country,
          status: "pending",
        },
      ])
      .single();

    if (error) throw error;

    res.json({ success: true, reservation: data });
  } catch (err) {
    console.error("DB INSERT ERROR:", err);
    res.status(500).json({ error: "Failed to insert reservation" });
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { user_id, check_in, check_out, nights, total_price, amount_paid, guests } =
      req.body.payload;

    console.log("📝 Creating PaymentIntent with:");
    console.log("  user_id:", user_id);
    console.log("  check_in:", check_in);
    console.log("  check_out:", check_out);
    console.log("  guests:", guests);

    if (!user_id || !amount_paid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount_paid * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
      metadata: {
        user_id: String(user_id),
        check_in: String(check_in),
        check_out: String(check_out),
        nights: String(nights),
        total_price: String(total_price),
        guests: String(guests || 1),
      },
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id);
    console.log("   Metadata:", paymentIntent.metadata);

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    return res.status(500).json({ error: "Failed to create PaymentIntent" });
  }
};

// export const stripeWebhook = async () => {
//   bodyParser.raw({ type: "application/json" }),
//     async (req, res) => {
//       const sig = req.headers["stripe-signature"];

//       let event;
//       try {
//         event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//       } catch (err) {
//         console.error("❌ Webhook signature verification failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//       }

//       // -------------------------
//       // HANDLE EVENTS
//       // -------------------------
//       if (event.type === "payment_intent.succeeded") {
//         const pi = event.data.object;
//         const charge = pi.charges.data[0];
//         const billing = charge.billing_details;

//         console.log("💰 PAYMENT SUCCESS:", pi.id);

//         // Insert reservation into Supabase
//         const { error } = await supabase.from("reservations").insert([
//           {
//             user_id: pi.metadata.user_id,
//             start_date: pi.metadata.start_date,
//             end_date: pi.metadata.end_date,
//             number_of_guests: pi.metadata.guests,
//             total_price: pi.metadata.total_price,
//             deposit_paid: pi.amount_received / 100,
//             payment_method: "credit_card",

//             // Billing details
//             billing_name: billing.name,
//             billing_street: billing.address?.line1 ?? "",
//             billing_city: billing.address?.city ?? "",
//             billing_postal_code: billing.address?.postal_code ?? "",
//             billing_state: billing.address?.state ?? "",
//             billing_country: billing.address?.country ?? "",
//             phone: billing.phone ?? "",

//             stripe_payment_intent_id: pi.id,
//             status: "confirmed",
//           },
//         ]);

//         if (error) {
//           console.error("❌ Supabase insert failed:", error);
//         } else {
//           console.log("✅ Reservation stored successfully.");
//         }
//       }

//       // -------------------------
//       // PAYMENT FAILED
//       // -------------------------
//       if (event.type === "payment_intent.payment_failed") {
//         const pi = event.data.object;
//         console.log("❌ PAYMENT FAILED:", pi.id);
//       }

//       res.json({ received: true });
//     };
// };
