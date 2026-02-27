import supabase from "../config/supabaseClient.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL;

export const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await resend.emails.send({
      from: `Four Roses Contact <Contact@fourroses.fignet.ca>`,
      to: adminEmail,
      subject: subject || `New contact from ${name}`,
      reply_to: email,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Form Message</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    .wrapper {
      max-width: 580px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      background-color: #1e1a17;
      border-radius: 16px 16px 0 0;
      padding: 36px 48px 32px;
      text-align: center;
    }

    .header .badge {
      display: inline-block;
      background: #d4855e;
      color: #fff;
      font-weight: 500;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 100px;
      margin-bottom: 18px;
    }

    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: #f5f0e8;
      line-height: 1.3;
    }

    .header p {
      margin-top: 8px;
      color: #a09484;
      font-size: 13px;
      font-weight: 300;
    }

    /* Body */
    .body {
      background: #ffffff;
      padding: 36px 48px;
    }

    /* Sender card */
    .sender-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #1e1a17;
      color: #d4855e;
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .sender-info .name {
      font-size: 15px;
      font-weight: 500;
      color: #2c2825;
    }

    .sender-info .email {
      font-size: 12px;
      color: #9c8e82;
      margin-top: 2px;
    }

    /* Section label */
    .section-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #d4855e;
      margin-bottom: 12px;
    }

    /* Message block */
    .message-block {
      background: #faf8f5;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      padding: 22px 24px;
      font-size: 14px;
      line-height: 1.8;
      color: #3a3330;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    .reply-note {
      font-size: 13px;
      color: #7a6e64;
      text-align: center;
      line-height: 1.7;
    }

    .reply-note a {
      color: #d4855e;
      text-decoration: none;
      font-weight: 500;
    }

    /* Footer */
    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 22px 48px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer strong { color: #5c524a; }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="badge">✉ Contact Form</div>
      <h1>New Message Received</h1>
      <p>Someone reached out via the contact form.</p>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Sender -->
      <div class="sender-card">
        <div class="avatar">${name.charAt(0)}</div>
        <div class="sender-info">
          <div class="name">${name}</div>
          <div class="email">${email}</div>
        </div>
      </div>

      <!-- Message -->
      <div class="section-label">Message</div>
      <div class="message-block">${message}</div>

      <hr class="divider" />

      <p class="reply-note">
        Reply directly to this email to respond to <strong>${name}</strong> at <a href="mailto:${email}">${email}</a>.
      </p>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Four Roses</strong> · Contact Form Notification</p>
      <p style="margin-top:6px;">© 2025 Four Roses · All rights reserved</p>
    </div>

  </div>
</body>
</html>
      `,
    });

    res.status(200).json({ success: true, response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
};

export const sendBookingInitializedEmail = async (req, res) => {
  const { reservation_id } = req.body;

  if (!reservation_id) {
    return res.status(400).json({ error: "Missing reservation_id" });
  }

  try {
    // Fetch reservation from Supabase
    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservation_id)
      .single();

    if (error || !reservation) {
      console.error(error);
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Build the email HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Booking Initialized</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    .wrapper {
      max-width: 620px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      background-color: #1e1a17;
      border-radius: 16px 16px 0 0;
      padding: 36px 48px 32px;
      text-align: center;
    }

    .header .badge {
      display: inline-block;
      background: #b07ed4;
      color: #fff;
      font-weight: 500;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 100px;
      margin-bottom: 18px;
    }

    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: #f5f0e8;
      line-height: 1.3;
    }

    .header p {
      margin-top: 8px;
      color: #a09484;
      font-size: 13px;
      font-weight: 300;
    }

    /* Body */
    .body {
      background: #ffffff;
      padding: 36px 48px;
    }

    .intro {
      font-size: 14px;
      line-height: 1.7;
      color: #5c524a;
      margin-bottom: 32px;
      padding: 14px 18px;
      background: #f7f2fb;
      border-left: 3px solid #b07ed4;
      border-radius: 0 8px 8px 0;
    }

    /* Section label */
    .section-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #b07ed4;
      margin-bottom: 12px;
      margin-top: 28px;
    }

    .section-label:first-of-type { margin-top: 0; }

    /* Card */
    .card {
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      overflow: hidden;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 13px 20px;
      border-bottom: 1px solid #f0ece4;
    }

    .detail-row:last-child { border-bottom: none; }

    .detail-label {
      font-size: 12px;
      color: #9c8e82;
      font-weight: 400;
    }

    .detail-value {
      font-size: 13px;
      color: #2c2825;
      font-weight: 500;
      text-align: right;
      max-width: 60%;
    }

    /* Status pill inline */
    .status-pill {
      display: inline-block;
      background: #f0e9f8;
      color: #b07ed4;
      font-size: 11px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.3px;
    }

    /* Pricing hero */
    .pricing-hero {
      background: #1e1a17;
      border-radius: 12px;
      padding: 22px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .pricing-hero .left .label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #7a6e64;
      margin-bottom: 5px;
    }

    .pricing-hero .left .amount {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      color: #f5f0e8;
      font-weight: 600;
    }

    .pricing-hero .right { text-align: right; }

    .pricing-hero .right .method {
      font-size: 12px;
      color: #7a6e64;
      margin-bottom: 6px;
    }

    .pricing-hero .right .paid-badge {
      display: inline-block;
      background: #2a2030;
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 12px;
      color: #b07ed4;
      font-weight: 500;
    }

    .pricing-hero .right .paid-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #b07ed4;
      display: inline-block;
      margin-right: 5px;
    }

    /* Breakdown */
    .breakdown-grid {
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      overflow: hidden;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid #f0ece4;
      font-size: 13px;
    }

    .breakdown-row:last-child {
      border-bottom: none;
      background: #faf8f5;
    }

    .breakdown-row .b-label { color: #9c8e82; }
    .breakdown-row .b-value { color: #2c2825; font-weight: 500; }

    /* Two col */
    .two-col {
      display: flex;
      gap: 12px;
    }

    .two-col .card { flex: 1; }

    /* Address block */
    .address-block {
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 13px;
      line-height: 1.8;
      color: #2c2825;
    }

    .address-block .name {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .address-block .addr { color: #7a6e64; }

    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    .final-note {
      font-size: 13px;
      line-height: 1.7;
      color: #7a6e64;
      text-align: center;
    }

    /* Footer */
    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 22px 48px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer strong { color: #5c524a; }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="badge">🆕 New Booking</div>
      <h1>A Reservation Has Been Started</h1>
      <p>Someone has begun their booking — review the details below.</p>
    </div>

    <!-- Body -->
    <div class="body">

      <div class="intro">
        A new reservation has been initialized. This is an internal notification to keep you up to date on incoming bookings.
      </div>

      <!-- Reservation Details -->
      <div class="section-label">Reservation Details</div>
      <div class="card">
        <div class="detail-row">
          <span class="detail-label">Reservation ID</span>
          <span class="detail-value">${reservation.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-pill">${reservation.status}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Created</span>
          <span class="detail-value">${reservation.created_at}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in</span>
          <span class="detail-value">${reservation.start_date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out</span>
          <span class="detail-value">${reservation.end_date}</span>
        </div>
      </div>

      <!-- Pricing -->
      <div class="section-label">Pricing</div>
      <div class="pricing-hero">
        <div class="left">
          <div class="label">Total Price</div>
          <div class="amount">€${reservation.total_price}</div>
        </div>
        <div class="right">
          <div class="method">${reservation.payment_method}</div>
          <div class="paid-badge">
            <span class="paid-dot"></span>€${reservation.amount_paid} paid
          </div>
        </div>
      </div>
      <div class="breakdown-grid">
        <div class="breakdown-row">
          <span class="b-label">Accommodation Subtotal</span>
          <span class="b-value">€${reservation.accommodation_subtotal}</span>
        </div>
        <div class="breakdown-row">
          <span class="b-label">Sales Tax</span>
          <span class="b-value">€${reservation.sales_tax}</span>
        </div>
        <div class="breakdown-row">
          <span class="b-label">Tourist Tax</span>
          <span class="b-value">€${reservation.tourist_tax}</span>
        </div>
      </div>

      <!-- Guests & Contact -->
      <div class="section-label">Guests & Contact</div>
      <div class="two-col">
        <div class="card">
          <div class="detail-row">
            <span class="detail-label">Adults</span>
            <span class="detail-value">${reservation.guests_over}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Children</span>
            <span class="detail-value">${reservation.guests_under}</span>
          </div>
        </div>
        <div class="card">
          <div class="detail-row">
            <span class="detail-label">Phone</span>
            <span class="detail-value">${reservation.phone}</span>
          </div>
        </div>
      </div>

      <!-- Billing -->
      <div class="section-label">Billing Information</div>
      <div class="address-block">
        <div class="name">${reservation.billing_name}</div>
        <div class="addr">
          ${reservation.billing_address}<br/>
          ${reservation.billing_city}, ${reservation.billing_state}<br/>
          ${reservation.billing_postal_code}, ${reservation.billing_country}
        </div>
      </div>

      <hr class="divider" />

      <p class="final-note">
        This email notifies you that someone has begun their booking. Monitor the reservation for completion.
      </p>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Four Roses</strong> · Internal Notification</p>
      <p style="margin-top:6px;">© 2025 Four Roses · All rights reserved</p>
    </div>

  </div>
</body>
</html>
    `;

    // Send the email
    const response = await resend.emails.send({
      from: `Four Roses Bookings <Booking@fourroses.fignet.ca>`,
      to: adminEmail,
      reply_to: "booking@fourroses.fignet.ca",
      subject: `New Booking Started - ${reservation.billing_name}`,
      html,
    });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send booking email" });
  }
};

export const sendBookingPaidEmail = async (req, res) => {
  const { reservation_id } = req.body;

  if (!reservation_id) {
    return res.status(400).json({ error: "Missing reservation_id" });
  }

  try {
    // Fetch reservation from Supabase
    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservation_id)
      .single();

    if (error || !reservation) {
      console.error(error);
      return res.status(404).json({ error: "Reservation not found" });
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Balance Paid in Full</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    .wrapper {
      max-width: 620px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      background-color: #1e1a17;
      border-radius: 16px 16px 0 0;
      padding: 36px 48px 32px;
      text-align: center;
    }

    .header .badge {
      display: inline-block;
      background: #7eb89a;
      color: #fff;
      font-weight: 500;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 100px;
      margin-bottom: 18px;
    }

    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: #f5f0e8;
      line-height: 1.3;
    }

    .header p {
      margin-top: 8px;
      color: #a09484;
      font-size: 13px;
      font-weight: 300;
    }

    /* Body */
    .body {
      background: #ffffff;
      padding: 36px 48px;
    }

    .intro {
      font-size: 14px;
      line-height: 1.7;
      color: #5c524a;
      margin-bottom: 32px;
      padding: 14px 18px;
      background: #f2faf5;
      border-left: 3px solid #7eb89a;
      border-radius: 0 8px 8px 0;
    }

    /* Section label */
    .section-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #7eb89a;
      margin-bottom: 12px;
      margin-top: 28px;
    }

    .section-label:first-of-type {
      margin-top: 0;
    }

    /* Card */
    .card {
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 13px 20px;
      border-bottom: 1px solid #f0ece4;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: 12px;
      color: #9c8e82;
      font-weight: 400;
    }

    .detail-value {
      font-size: 13px;
      color: #2c2825;
      font-weight: 500;
      text-align: right;
      max-width: 60%;
    }

    /* Payment hero */
    .payment-hero {
      background: #1e1a17;
      border-radius: 12px;
      padding: 22px 24px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-hero .left .label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #7a6e64;
      margin-bottom: 5px;
    }

    .payment-hero .left .amount {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      color: #f5f0e8;
      font-weight: 600;
    }

    .payment-hero .right {
      text-align: right;
    }

    .payment-hero .right .method {
      font-size: 12px;
      color: #7a6e64;
      margin-bottom: 4px;
      letter-spacing: 0.3px;
    }

    .payment-hero .right .status-pill {
      display: inline-block;
      background: #2d3d2f;
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 12px;
      color: #7eb89a;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .payment-hero .right .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #7eb89a;
      display: inline-block;
      margin-right: 5px;
    }

    /* Breakdown grid */
    .breakdown-grid {
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid #f0ece4;
      font-size: 13px;
    }

    .breakdown-row:last-child {
      border-bottom: none;
      background: #faf8f5;
      font-weight: 500;
    }

    .breakdown-row .b-label { color: #9c8e82; }
    .breakdown-row .b-value { color: #2c2825; font-weight: 500; }

    /* Two-col grid */
    .two-col {
      display: flex;
      gap: 12px;
      margin-bottom: 4px;
    }

    .two-col .card {
      flex: 1;
      margin-bottom: 0;
    }

    /* Address block */
    .address-block {
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 13px;
      line-height: 1.8;
      color: #2c2825;
    }

    .address-block .name {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .address-block .addr {
      color: #7a6e64;
    }

    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    .final-note {
      font-size: 13px;
      line-height: 1.7;
      color: #7a6e64;
      text-align: center;
    }

    /* Footer */
    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 22px 48px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer strong { color: #5c524a; }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="badge">💳 Balance Paid in Full</div>
      <h1>Full Payment Received</h1>
      <p>The guest's reservation is now fully settled.</p>
    </div>

    <!-- Body -->
    <div class="body">

      <div class="intro">
        The guest has paid the remaining balance for their reservation. No further action is required.
      </div>

      <!-- Reservation Details -->
      <div class="section-label">Reservation Details</div>
      <div class="card">
        <div class="detail-row">
          <span class="detail-label">Reservation ID</span>
          <span class="detail-value">${reservation.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value">${reservation.status}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Created</span>
          <span class="detail-value">${reservation.created_at}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in</span>
          <span class="detail-value">${reservation.start_date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out</span>
          <span class="detail-value">${reservation.end_date}</span>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="section-label">Payment Summary</div>
      <div class="payment-hero">
        <div class="left">
          <div class="label">Total Paid</div>
          <div class="amount">€${reservation.total_price}</div>
        </div>
        <div class="right">
          <div class="method">${reservation.payment_method}</div>
          <div class="status-pill">
            <span class="status-dot"></span>Paid in Full
          </div>
        </div>
      </div>

      <!-- Breakdown -->
      <div class="section-label">Updated Breakdown</div>
      <div class="breakdown-grid">
        <div class="breakdown-row">
          <span class="b-label">Accommodation Subtotal</span>
          <span class="b-value">€${reservation.accommodation_subtotal}</span>
        </div>
        <div class="breakdown-row">
          <span class="b-label">Sales Tax</span>
          <span class="b-value">€${reservation.sales_tax}</span>
        </div>
        <div class="breakdown-row">
          <span class="b-label">Tourist Tax</span>
          <span class="b-value">€${reservation.tourist_tax}</span>
        </div>
        <div class="breakdown-row">
          <span class="b-label">Credit Fees</span>
          <span class="b-value">€${reservation.credit_fees}</span>
        </div>
      </div>

      <!-- Guests & Contact -->
      <div class="section-label">Guests & Contact</div>
      <div class="two-col">
        <div class="card">
          <div class="detail-row">
            <span class="detail-label">Adults</span>
            <span class="detail-value">${reservation.guests_over}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Children</span>
            <span class="detail-value">${reservation.guests_under}</span>
          </div>
        </div>
        <div class="card">
          <div class="detail-row">
            <span class="detail-label">Phone</span>
            <span class="detail-value">${reservation.phone}</span>
          </div>
        </div>
      </div>

      <!-- Billing -->
      <div class="section-label">Billing Information</div>
      <div class="address-block">
        <div class="name">${reservation.billing_name}</div>
        <div class="addr">
          ${reservation.billing_address}<br/>
          ${reservation.billing_city}, ${reservation.billing_state}<br/>
          ${reservation.billing_postal_code}, ${reservation.billing_country}
        </div>
      </div>

      <hr class="divider" />

      <p class="final-note">
        The guest has now fully paid for their stay. No further action is required.
      </p>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Four Roses</strong> · Internal Notification</p>
      <p style="margin-top:6px;">© 2025 Four Roses · All rights reserved</p>
    </div>

  </div>
</body>
</html>
`;

    // Send the email
    const response = await resend.emails.send({
      from: `4 Roses Bookings <Booking@fourroses.fignet.ca>`,
      to: adminEmail,
      reply_to: "booking@fourroses.fignet.ca",
      subject: `Balance Fully Paid - ${reservation.billing_name}`,
      html,
    });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send booking email" });
  }
};

export const sendBookingConfirmEmail = async (req, res) => {
  const { reservation_id } = req.body;

  if (!reservation_id) {
    return res.status(400).json({ error: "Missing reservation_id" });
  }

  try {
    // Fetch reservation from Supabase
    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservation_id)
      .single();

    if (error || !reservation) {
      console.error(error);
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Get the users email
    const { data: userInfo } = await supabase.auth.admin.getUserById(reservation.user_id);
    const customerEmail = userInfo.user.email;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      background-color: #1e1a17;
      border-radius: 16px 16px 0 0;
      padding: 40px 48px 36px;
      text-align: center;
    }

    .header .badge {
      display: inline-block;
      background: #c9a96e;
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 100px;
      margin-bottom: 20px;
    }

    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      font-weight: 600;
      color: #f5f0e8;
      line-height: 1.3;
    }

    .header p {
      margin-top: 10px;
      color: #a09484;
      font-size: 14px;
      font-weight: 300;
    }

    /* Body */
    .body {
      background: #ffffff;
      padding: 40px 48px;
    }

    .greeting {
      font-size: 16px;
      font-weight: 400;
      color: #2c2825;
      margin-bottom: 12px;
    }

    .intro {
      font-size: 14px;
      line-height: 1.7;
      color: #5c524a;
      margin-bottom: 36px;
    }

    /* Section */
    .section-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #c9a96e;
      margin-bottom: 16px;
    }

    /* Details card */
    .details-card {
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 28px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid #f0ece4;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: 12px;
      color: #9c8e82;
      font-weight: 400;
      letter-spacing: 0.3px;
    }

    .detail-value {
      font-size: 14px;
      color: #2c2825;
      font-weight: 500;
      text-align: right;
    }

    /* Payment card */
    .payment-card {
      background: #1e1a17;
      border-radius: 12px;
      padding: 24px 24px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-card .left .label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #7a6e64;
      margin-bottom: 6px;
    }

    .payment-card .left .amount {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #f5f0e8;
      font-weight: 600;
    }

    .payment-card .right {
      background: #2d271f;
      border-radius: 8px;
      padding: 10px 16px;
      text-align: center;
    }

    .payment-card .right .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #5cb85c;
      display: inline-block;
      margin-right: 6px;
    }

    .payment-card .right span {
      font-size: 12px;
      color: #c9a96e;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    /* Info box */
    .info-box {
      background: #f8f5f0;
      border-left: 3px solid #c9a96e;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin-bottom: 28px;
      font-size: 14px;
      line-height: 1.7;
      color: #5c524a;
    }

    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    .footer-note {
      font-size: 13px;
      line-height: 1.7;
      color: #7a6e64;
      margin-bottom: 8px;
    }

    /* Footer */
    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 24px 48px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer strong {
      color: #5c524a;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="badge">✓ Payment Confirmed</div>
      <h1>Your Stay is Confirmed</h1>
      <p>We can't wait to welcome you.</p>
    </div>

    <!-- Body -->
    <div class="body">

      <p class="greeting">Hello <strong>${reservation.billing_name}</strong>,</p>
      <p class="intro">
        Your IBAN bank transfer has been validated and your payment has been fully processed.
        Everything is in order — your booking is now complete.
      </p>

      <!-- Reservation Details -->
      <div class="section-label">Reservation Details</div>
      <div class="details-card">
        <div class="detail-row">
          <span class="detail-label">Reservation ID</span>
          <span class="detail-value">${reservation.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in</span>
          <span class="detail-value">${reservation.start_date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out</span>
          <span class="detail-value">${reservation.end_date}</span>
        </div>
      </div>

      <!-- Payment -->
      <div class="section-label">Payment Confirmation</div>
      <div class="payment-card">
        <div class="left">
          <div class="label">Total Paid</div>
          <div class="amount">€${reservation.amount_paid}</div>
        </div>
        <div class="right">
          <span class="status-dot"></span>
          <span>Fully Paid</span>
        </div>
      </div>

      <!-- Info box -->
      <div class="info-box">
        Prior to check-in, you'll receive arrival instructions and all the property details you need for a smooth, comfortable stay.
      </div>

      <hr class="divider" />

      <p class="footer-note">
        If you have any questions in the meantime, simply reply to this email — we're happy to help.
      </p>
      <p class="footer-note">
        Thank you for choosing to stay with us. We look forward to welcoming you soon.
      </p>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Need help?</strong> Reply to this email and we'll get back to you promptly.</p>
      <p style="margin-top:8px;">© 2025 · All rights reserved</p>
    </div>

  </div>
</body>
</html>
`;

    // Send the email
    const response = await resend.emails.send({
      from: `Four Roses Bookings <Booking@fourroses.fignet.ca>`,
      to: `${customerEmail}`,
      reply_to: "booking@fourroses.fignet.ca",
      subject: `Your Payment Has Been Confirmed - Reservation ${reservation.id}`,
      html,
    });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send booking email" });
  }
};

export const sendSecurityDepositSettledEmail = async (req, res) => {
  const { reservation_id } = req.body;

  if (!reservation_id) {
    return res.status(400).json({ error: "Missing reservation_id" });
  }

  try {
    // Fetch reservation from Supabase
    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservation_id)
      .single();

    if (error || !reservation) {
      console.error(error);
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Get the user's email
    const { data: userInfo } = await supabase.auth.admin.getUserById(reservation.user_id);
    const customerEmail = userInfo.user.email;

    // Build HTML email
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Security Deposit Settled</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      background-color: #1e1a17;
      border-radius: 16px 16px 0 0;
      padding: 40px 48px 36px;
      text-align: center;
    }

    .header .badge {
      display: inline-block;
      background: #6e9ec9;
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 100px;
      margin-bottom: 20px;
    }

    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      font-weight: 600;
      color: #f5f0e8;
      line-height: 1.3;
    }

    .header p {
      margin-top: 10px;
      color: #a09484;
      font-size: 14px;
      font-weight: 300;
    }

    /* Body */
    .body {
      background: #ffffff;
      padding: 40px 48px;
    }

    .greeting {
      font-size: 16px;
      font-weight: 400;
      color: #2c2825;
      margin-bottom: 12px;
    }

    .intro {
      font-size: 14px;
      line-height: 1.7;
      color: #5c524a;
      margin-bottom: 36px;
    }

    /* Section label */
    .section-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #6e9ec9;
      margin-bottom: 16px;
    }

    /* Details card */
    .details-card {
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 28px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid #f0ece4;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: 12px;
      color: #9c8e82;
      font-weight: 400;
      letter-spacing: 0.3px;
    }

    .detail-value {
      font-size: 14px;
      color: #2c2825;
      font-weight: 500;
      text-align: right;
    }

    /* Deposit card */
    .deposit-card {
      background: #1e1a17;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .deposit-card .left .label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #7a6e64;
      margin-bottom: 6px;
    }

    .deposit-card .left .amount {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #f5f0e8;
      font-weight: 600;
    }

    .deposit-card .right {
      background: #2d271f;
      border-radius: 8px;
      padding: 10px 16px;
      text-align: center;
    }

    .deposit-card .right .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6e9ec9;
      display: inline-block;
      margin-right: 6px;
    }

    .deposit-card .right span {
      font-size: 12px;
      color: #6e9ec9;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    /* Info box */
    .info-box {
      background: #f3f7fb;
      border-left: 3px solid #6e9ec9;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin-bottom: 28px;
      font-size: 14px;
      line-height: 1.7;
      color: #4a5a6a;
    }

    .info-box a {
      color: #4a85b5;
      text-decoration: underline;
    }

    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    .footer-note {
      font-size: 13px;
      line-height: 1.7;
      color: #7a6e64;
      margin-bottom: 8px;
    }

    /* Sign-off */
    .signoff {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0ece4;
      font-size: 14px;
      color: #5c524a;
      font-style: italic;
      font-family: 'Playfair Display', serif;
      line-height: 1.7;
    }

    /* Footer */
    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 24px 48px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer strong {
      color: #5c524a;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="badge">🔒 Deposit Settled</div>
      <h1>Your Deposit Has Been Returned</h1>
      <p>Everything is wrapped up — thank you for your stay.</p>
    </div>

    <!-- Body -->
    <div class="body">

      <p class="greeting">Hello <strong>${reservation.billing_name}</strong>,</p>
      <p class="intro">
        Your security deposit has been successfully processed and the transaction is now complete.
        We hope you had a wonderful stay and that everything met your expectations.
      </p>

      <!-- Reservation Details -->
      <div class="section-label">Reservation Details</div>
      <div class="details-card">
        <div class="detail-row">
          <span class="detail-label">Reservation ID</span>
          <span class="detail-value">${reservation.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in</span>
          <span class="detail-value">${reservation.start_date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out</span>
          <span class="detail-value">${reservation.end_date}</span>
        </div>
      </div>

      <!-- Deposit -->
      <div class="section-label">Deposit Information</div>
      <div class="deposit-card">
        <div class="left">
          <div class="label">Amount Refunded</div>
          <div class="amount">€${reservation.security_deposit_refunded_amount}</div>
        </div>
        <div class="right">
          <span class="status-dot"></span>
          <span>Refunded</span>
        </div>
      </div>

      <!-- Info box -->
      <div class="info-box">
        You can download a PDF copy of your invoice anytime from your account dashboard under the <strong>"Booking"</strong> section.
      </div>

      <p class="footer-note">
        If you have any questions or need assistance, simply reply to this email — we're always happy to help.
      </p>

      <div class="signoff">
        "Thank you for staying at Four Roses. We hope to have the pleasure of welcoming you back in the future."
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Need help?</strong> Reply to this email and we'll get back to you promptly.</p>
      <p style="margin-top:8px;">© 2025 Four Roses · All rights reserved</p>
    </div>

  </div>
</body>
</html>
    `;

    // Send the email
    const response = await resend.emails.send({
      from: `Four Roses Bookings <Booking@fourroses.fignet.ca>`,
      reply_to: "booking@fourroses.fignet.ca",
      to: `${customerEmail}`,
      subject: `Your Security Deposit Has Been Settled - Reservation ${reservation.id}`,
      html,
    });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send security deposit email" });
  }
};
