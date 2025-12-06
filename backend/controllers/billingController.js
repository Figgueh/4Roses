import supabase from "../config/supabaseClient.js";
import Stripe from "stripe";
import puppeteer from "puppeteer";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";

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

  // Load logo as Base64 for PDF usage
  const logoPath = path.resolve("assets/logo/4RosesHeader.png"); // adjust folder
  const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });

  try {
    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    const { data: userInfo } = await supabase.auth.admin.getUserById(reservation.user_id);

    // Convert missing values safely
    const toMoney = (n) => Number(n || 0).toFixed(2);

    const invoiceData = {
      invoice_number: reservation.id,
      customer_name: reservation.billing_name || "Guest",
      customer_email: userInfo.user.email || "N/A",
      reservation_id: reservation.id,
      check_in: reservation.start_date,
      check_out: reservation.end_date,

      // Financial fields
      accommodation_subtotal: toMoney(reservation.accommodation_subtotal),
      sales_tax: toMoney(reservation.sales_tax),
      tourist_tax: toMoney(reservation.tourist_tax),
      credit_fees: toMoney(reservation.credit_fees),
      security_deposit_charge: toMoney(500),

      subtotal: toMoney(
        reservation.accommodation_subtotal +
          reservation.sales_tax +
          reservation.tourist_tax +
          reservation.credit_fees +
          500
      ),

      amount_paid: toMoney(reservation.amount_paid),
      security_deposit_refunded_amount: toMoney(reservation.security_deposit_refunded_amount),
      total: toMoney(reservation.amount_paid - 500),

      payment_method: reservation.payment_method,

      date_issued: dayjs().format("YYYY-MM-DD"),

      // Billing
      billing: {
        name: reservation.billing_name,
        address: reservation.billing_address,
        city: reservation.billing_city,
        state: reservation.billing_state,
        postal: reservation.billing_postal_code,
        country: reservation.billing_country,
      },

      guests_over: reservation.guests_over,
      guests_under: reservation.guests_under,
      phone: reservation.phone,

      status: reservation.status,
    };

    const html = `
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Invoice</title>
<style>
  body {
    font-family: Arial, sans-serif;
    padding: 0;
    margin: 0;
    color: #333;
  }

  .container {
    padding: 32px;
    max-width: 800px;
    margin: auto;
  }

  .box,
  .reservation-box {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 28px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 22px;
    border-bottom: 2px solid #eee;
    margin-bottom: 32px;
  }

  .logo {
    max-width: 140px;
  }

  h2 {
    margin: 0 0 14px 0;
    font-size: 20px;
  }

  h3 {
    margin: 0 0 12px 0;
    font-size: 17px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
  }

  th, td {
    padding: 10px 8px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f5f5f5;
  }

  .total-row td {
    font-weight: bold;
    font-size: 17px;
  }

  .two-column {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 32px;
  }

  .col-box {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
  }

  .col-box p {
  margin: 3px 0;
  }

  .reservation-box p {
  margin: 5px 1px;
  }
</style>
      </head>

<body>
  <div class="container">

    <!-- HEADER -->
    <div class="header">
      <img class="logo" src="data:image/png;base64,${logoBase64}" alt="Logo" />
      <div style="font-size: 24px; font-weight: bold;">
        Invoice #${invoiceData.invoice_number}
      </div>
    </div>

    <!-- CUSTOMER + BILLING -->
    <div class="two-column">

      <!-- Customer Details -->
      <div class="col-box">
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${invoiceData.customer_name}</p>
        <p><strong>Email:</strong> ${invoiceData.customer_email}</p>
        <p><strong>Phone:</strong> ${invoiceData.phone}</p>
        <p><strong>Date Issued:</strong> ${invoiceData.date_issued}</p>
      </div>

      <!-- Billing Address -->
      <div class="col-box">
        <h3>Billing Address</h3>
        <p>${invoiceData.billing.name}</p>
        <p>${invoiceData.billing.address}</p>
        <p>${invoiceData.billing.city}, ${invoiceData.billing.state}</p>
        <p>${invoiceData.billing.postal}</p>
        <p>${invoiceData.billing.country}</p>
      </div>

    </div>

    <!-- RESERVATION INFO -->
    <div class="reservation-box">
      <h2>Reservation Information</h2>
      <p><strong>Reservation ID:</strong> ${invoiceData.reservation_id}</p>
      <p><strong>Payment method:</strong> ${invoiceData.payment_method}</p>
      <p><strong>Check-in:</strong> ${invoiceData.check_in}</p>
      <p><strong>Check-out:</strong> ${invoiceData.check_out}</p>
      <p><strong>Guests:</strong> ${invoiceData.guests_over} adults, ${invoiceData.guests_under} children</p>
      <p><strong>Status:</strong> ${invoiceData.status}</p>
    </div>

    <!-- CHARGES SUMMARY -->
    <div class="box">
      <h2>Charges Summary</h2>

      <table>
        <tr><th>Description</th><th>Amount (€)</th></tr>

        <tr><td>Accommodation Subtotal</td><td>${invoiceData.accommodation_subtotal}</td></tr>
        <tr><td>Sales Tax</td><td>${invoiceData.sales_tax}</td></tr>
        <tr><td>Tourist Tax</td><td>${invoiceData.tourist_tax}</td></tr>
        <tr><td>Credit Card Fees</td><td>${invoiceData.credit_fees}</td></tr>
        <tr><td>Security Deposit Charge</td><td>${invoiceData.security_deposit_charge}</td></tr>

        <tr class="total-row">
          <td>Total</td>
          <td>${invoiceData.subtotal}</td>
        </tr>

        <tr><td>Security Deposit Refunded</td><td> - ${invoiceData.security_deposit_refunded_amount}</td></tr>
        <tr class="total-row"><td>Grand Total</td><td>${invoiceData.total}</td></tr>
      </table>

    </div>

    <p style="text-align:center; color:#888; margin-top:40px;">
      Thank you for your booking. Contact support if you have questions.
    </p>

  </div>
</body>
</html>
    `;

    // ---------------------------------------------------------
    // PDF GENERATION
    // ---------------------------------------------------------
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Return file to client
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
      accommodation_subtotal,
      sales_tax,
      tourist_tax,
      total_price,
      amount_paid,
      guests_over,
      guests_under,
      credit_fees,
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
        accommodation_subtotal: accommodation_subtotal,
        sales_tax: sales_tax,
        tourist_tax: tourist_tax,
        total_price: String(total_price),
        guests_over: String(guests_over || 1),
        guests_under: String(guests_under),
        credit_fees: credit_fees,
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

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(remaining * 100), // convert € to cents
      currency: "eur",
      automatic_payment_methods: { enabled: true },
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
