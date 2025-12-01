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
    next(err);
  }
};

// GET price for all months
//
export const getMonthlyPrice = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("monthly_pricing")
      .select("month, price")
      .order("month", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to load monthly prices" });
    }

    const monthlyPrices = {};

    data.forEach((row) => {
      monthlyPrices[row.month] = row.price;
    });

    return res.json(monthlyPrices);
  } catch (err) {
    next(err);
  }
};

// GET check if reservation isn't already confirmed
// /check/:check_in/:check_out
export const checkReservation = async (req, res, next) => {
  const { check_in, check_out } = req.params;

  try {
    // Check if the dates are available
    const { data: existing } = await supabase
      .from("reservations")
      .select("*")
      .eq("status", "confirmed")
      .lte("start_date", check_out)
      .gte("end_date", check_in);

    res.json({ isBooked: existing?.length > 0 });
  } catch (err) {
    next(err);
  }
};

// GET reservation data by id
//
export const getReservationData = async (req, res, next) => {
  const { id } = req.params;

  let bookingData = {};

  try {
    // First assume the id submitted is the reservation id
    const { data: bookingDataById, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      bookingData = bookingDataById;
    } else {
      // If the reservation id isn't found, then look up based on the payment intent
      const { data: bookingDataByIntent, error } = await supabase
        .from("reservations")
        .select("*")
        .contains("payment_intent", [id])
        .single();

      if (!error) {
        bookingData = bookingDataByIntent;
      } else {
        console.error(error);
        return res.status(500).json({ error: "Failed to load reservation data." });
      }
    }

    // Get the users email
    const { data: userInfo } = await supabase.auth.admin.getUserById(bookingData.user_id);

    return res.json({ booking: { ...bookingData, email: userInfo.user.email } });
  } catch (err) {
    next(err);
  }
};

export const createReservation = async (req, res) => {
  try {
    const {
      user_id,
      start_date,
      end_date,
      total_price,
      amount_paid,
      number_of_guests,
      payment_method,

      phone,
      billing_name,
      billing_address,
      billing_country,
      billing_city,
      billing_state,
      billing_postal_code,
    } = req.body;

    if (
      !user_id ||
      !start_date ||
      !end_date ||
      !total_price ||
      !amount_paid ||
      !phone ||
      !billing_name ||
      !billing_address ||
      !billing_country ||
      !billing_city ||
      !billing_state ||
      !billing_postal_code
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["iban", "credit_card"].includes(payment_method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id,
          start_date,
          end_date,
          total_price,
          amount_paid,
          payment_method,
          number_of_guests,
          phone,
          billing_name,
          billing_address,
          billing_country,
          billing_city,
          billing_state,
          billing_postal_code,
          status: "pending",
        },
      ])
      .select()
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

    if (!user_id || !amount_paid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the dates are available
    const { data: existing } = await supabase
      .from("reservations")
      .select("*")
      .eq("status", "confirmed")
      .lte("start_date", check_out)
      .gte("end_date", check_in);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: "Dates already booked" });
    }

    // Fetch the users database data
    const { data: databaseUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if (userError) console.log("There must be a user to create a payment intent");

    let customerId = databaseUser.stripe_customer_id;

    // If the users hasn't setup a stripe account
    if (!customerId) {
      // Get the users email
      const { data: supabaseUser } = await supabase.auth.admin.getUserById(user_id);

      // Create the stripe account
      const customer = await stripe.customers.create({
        email: supabaseUser.email,
        name: databaseUser.full_name,
      });

      customerId = customer.id;

      await supabase
        .from("users")
        .update({
          stripe_customer_id: customerId,
        })
        .eq("id", user_id);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount_paid * 100),
      currency: "eur",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
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

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    return res.status(500).json({ error: "Failed to create PaymentIntent" });
  }
};
