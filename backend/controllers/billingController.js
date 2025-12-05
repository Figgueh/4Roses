import supabase from "../config/supabaseClient.js";
import Stripe from "stripe";
import puppeteer from "puppeteer";
import dayjs from "dayjs";

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
    const { pricing } = req.body; // [{ month: 0, price: 100 }, ...]

    if (!Array.isArray(pricing)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const updatePromises = pricing.map(async (item) => {
      const { month, price } = item;
      if (month < 0 || month > 11 || typeof price !== "number" || price < 0) {
        throw new Error(`Invalid month or price for month ${month}`);
      }
      const { error } = await supabase
        .from("monthly_pricing")
        .update({ price, updated_at: new Date() })
        .eq("month", month);

      if (error) throw error;
    });

    await Promise.all(updatePromises);

    return res.json({ message: "All prices updated successfully" });
  } catch (err) {
    console.error(err);
    next(err);
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

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

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
    const {
      user_id,
      check_in,
      check_out,
      nights,
      total_price,
      amount_paid,
      guests_over,
      guests_under,
    } = req.body.payload;

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
        email: supabaseUser.user.email,
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
        guests_over: String(guests_over || 1),
        guests_under: String(guests_under),
        type: "deposit",
      },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    return res.status(500).json({ error: "Failed to create PaymentIntent" });
  }
};

export const continuePaymentIntent = async (req, res) => {
  try {
    const id = req.params.id;

    const { data: reservation } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const remaining = reservation.total_price - reservation.amount_paid;
    if (remaining <= 0) {
      return res.status(400).json({ error: "Booking already fully paid" });
    }

    // Get the stripe customer id
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", reservation.user_id)
      .single();

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(remaining * 100), // convert € to cents
      currency: "eur",
      customer: userData.stripe_customer_id,
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
      metadata: { reservationId: id, type: "remaining_balance" },
      description: `Remaining balance for booking #${id}`,
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create payment intent" });
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
