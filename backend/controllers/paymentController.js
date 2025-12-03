import supabase from "../config/supabaseClient.js";
import Stripe from "stripe";
import puppeteer from "puppeteer";
import dayjs from "dayjs";

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

// GET all ICS for calendar
// /ics
export const generateCalendar = async (req, res, next) => {
  try {
    // Fetch confirmed reservations
    const { data: reservations, error } = await supabase
      .from("reservations")
      .select("id, start_date, end_date, billing_name, status")
      .eq("status", "confirmed");

    if (error) throw error;

    // Build iCal content
    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//4Roses//Calendar Sync//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    reservations.forEach((r) => {
      const dtStart = dayjs(r.start_date).format("YYYYMMDD");
      const dtEnd = dayjs(r.end_date).format("YYYYMMDD");

      ical += `
BEGIN:VEVENT
UID:${r.id}@4roses.fignet.ca
DTSTAMP:${dayjs().format("YYYYMMDDTHHmmss")}Z
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
SUMMARY:Reservation - ${r.billing_name || "Guest"}
DESCRIPTION:Blocked (Reservation ID ${r.id})
END:VEVENT
`;
    });

    ical += `END:VCALENDAR`;

    // Return ICS file
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", "inline; filename=calendar.ics");
    res.send(ical);
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

// Update monthly price
export const updateMonthlyPrice = async (req, res, next) => {
  try {
    const { month } = req.params; // month is 0-11
    const { price } = req.body; // new price

    if (month < 0 || month > 11) {
      return res.status(400).json({ error: "Invalid month value" });
    }

    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    const { data, error } = await supabase
      .from("monthly_pricing")
      .update({ price, updated_at: new Date() })
      .eq("month", month)
      .select(); // return updated row

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update price" });
    }

    return res.json({ message: "Price updated successfully", data: data[0] });
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

// GET all reservations
export const getAllReservations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch reservations" });
    }

    return res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
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

// Gets all the reservations made by a single user.
// GET /user/:userId
export const getUserReservations = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        id,
        start_date,
        end_date,
        number_of_guests,
        total_price,
        amount_paid,
        status
      `
      )
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (error) throw error;

    res.status(200).json({ bookings: data });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
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

export const updateReservation = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: "Reservation ID is required" });
  }

  // Optional: whitelist allowed fields
  const allowed = [
    "status",
    "start_date",
    "end_date",
    "number_of_guests",
    "total_price",
    "amount_paid",
  ];
  const sanitized = {};

  for (const key of Object.keys(updates)) {
    if (allowed.includes(key)) sanitized[key] = updates[key];
  }

  if (Object.keys(sanitized).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const { data, error } = await supabase
      .from("reservations")
      .update(sanitized)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to update reservation" });
    }

    return res.json({ success: true, updated: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------------------
// Download Invoice as PDF
// -----------------------------------------
export const generatePDF = async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Fetch reservation from database
    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    // 2️⃣ Prepare invoice data
    const invoiceData = {
      invoice_number: reservation.id,
      customer_name: reservation.billing_name || reservation.user_name || "Guest",
      customer_email: reservation.email || "N/A",
      reservation_id: reservation.id,
      check_in: reservation.start_date,
      check_out: reservation.end_date,
      reservation_amount: reservation.total_price?.toFixed(2) || "0.00",
      security_deposit: reservation.security_deposit?.toFixed(2) || "0.00",
      subtotal: (reservation.total_price + (reservation.security_deposit || 0)).toFixed(2),
      taxes: "0.00", // adjust if you calculate taxes
      total: (reservation.total_price + (reservation.security_deposit || 0)).toFixed(2),
      date_issued: dayjs().format("YYYY-MM-DD"),
      logo_url: "https://yourdomain.com/logo.png", // optional
    };

    // 3️⃣ Build HTML template
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin:0; padding:0; color:#333; }
          .container { padding:30px; max-width:800px; margin:auto; border:1px solid #eee; border-radius:10px; }
          .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #eee; padding-bottom:20px; margin-bottom:20px; }
          .logo { max-width:150px; }
          .invoice-title { font-size:28px; font-weight:bold; color:#333; }
          table { width:100%; border-collapse:collapse; margin-top:20px; }
          th, td { padding:12px; border-bottom:1px solid #eee; text-align:left; }
          th { background-color:#f5f5f5; }
          .total { text-align:right; font-size:18px; font-weight:bold; }
          .footer { margin-top:40px; text-align:center; font-size:12px; color:#999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img class="logo" src="${invoiceData.logo_url}" alt="Logo" />
            <div class="invoice-title">Invoice #${invoiceData.invoice_number}</div>
          </div>
          <div>
            <p><strong>Customer:</strong> ${invoiceData.customer_name}</p>
            <p><strong>Email:</strong> ${invoiceData.customer_email}</p>
            <p><strong>Date:</strong> ${invoiceData.date_issued}</p>
            <p><strong>Reservation ID:</strong> ${invoiceData.reservation_id}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Reservation (${invoiceData.check_in} to ${invoiceData.check_out})</td>
                <td>${invoiceData.reservation_amount}</td>
              </tr>
              <tr>
                <td>Security Deposit</td>
                <td>${invoiceData.security_deposit}</td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>${invoiceData.subtotal}</td>
              </tr>
              <tr>
                <td>Taxes</td>
                <td>${invoiceData.taxes}</td>
              </tr>
              <tr>
                <td class="total">Total</td>
                <td class="total">${invoiceData.total}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Thank you for your booking. Please contact support if you have any questions.
          </div>
        </div>
      </body>
      </html>
    `;

    // 4️⃣ Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    // 5️⃣ Send PDF to client
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${reservation.id}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate invoice." });
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

// -----------------------------------------
// Refund Security Deposit
// -----------------------------------------
export const refundSecurity = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch reservation
    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !reservation) return res.status(404).json({ error: "Reservation not found" });

    // If already refunded
    if (reservation.security_refunded)
      return res.status(400).json({ error: "Security deposit already refunded." });

    // Make the refund
    const refund = await stripe.refunds.create({
      payment_intent: reservation.payment_intent_id,
      amount: Math.round(500 * 100), // convert €
    });

    // Update database
    await supabase.from("reservations").update({ security_refunded: true }).eq("id", id);

    return res.json({ success: true, refund });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Refund failed." });
  }
};
