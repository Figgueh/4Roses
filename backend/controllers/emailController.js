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
        <h2>New Contact Form Message</h2>
        <h3>New Message from ${name}</h3>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
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
      <h2>🆕 New Booking Initialized</h2>
      <p>A new reservation has been started.</p>

      <h3>📌 Reservation Details</h3>
      <p><b>ID:</b> ${reservation.id}</p>
      <p><b>Status:</b> ${reservation.status}</p>
      <p><b>Created:</b> ${reservation.created_at}</p>

      <h3>📅 Dates</h3>
      <p><b>Check-in:</b> ${reservation.start_date}</p>
      <p><b>Check-out:</b> ${reservation.end_date}</p>

      <h3>💶 Pricing</h3>
      <p><b>Accommodation Subtotal:</b> €${reservation.accommodation_subtotal}</p>
      <p><b>Sales Tax:</b> €${reservation.sales_tax}</p>
      <p><b>Tourist Tax:</b> €${reservation.tourist_tax}</p>
      <p><b>Total Price:</b> €${reservation.total_price}</p>
      <p><b>Amount Paid:</b> €${reservation.amount_paid}</p>
      <p><b>Payment Method:</b> ${reservation.payment_method}</p>

      <h3>👥 Guests</h3>
      <p><b>Adults:</b> ${reservation.guests_over}</p>
      <p><b>Children:</b> ${reservation.guests_under}</p>

      <h3>📞 Contact</h3>
      <p><b>Phone:</b> ${reservation.phone}</p>

      <h3>🏠 Billing Information</h3>
      <p><b>Name:</b> ${reservation.billing_name}</p>
      <p><b>Address:</b> ${reservation.billing_address}</p>
      <p><b>${reservation.billing_city}, ${reservation.billing_state}</b></p>
      <p><b>${reservation.billing_postal_code}, ${reservation.billing_country}</b></p>

      <hr />
      <p>This email notifies you that someone has begun their booking.</p>
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
  <h2>💳 Balance Paid in Full</h2>
  <p>The guest has paid the remaining balance for their reservation.</p>

  <h3>📌 Reservation Details</h3>
  <p><b>ID:</b> ${reservation.id}</p>
  <p><b>Status:</b> ${reservation.status}</p>
  <p><b>Created:</b> ${reservation.created_at}</p>

  <h3>📅 Dates</h3>
  <p><b>Check-in:</b> ${reservation.start_date}</p>
  <p><b>Check-out:</b> ${reservation.end_date}</p>

  <h3>💶 Payment Summary</h3>
  <p><b>Total Price:</b> €${reservation.total_price}</p>
  <p><b>Payment Method:</b> ${reservation.payment_method}</p>

  <h3>🧾 Updated Breakdown</h3>
  <p><b>Accommodation Subtotal:</b> €${reservation.accommodation_subtotal}</p>
  <p><b>Sales Tax:</b> €${reservation.sales_tax}</p>
  <p><b>Tourist Tax:</b> €${reservation.tourist_tax}</p>
  <p><b>Credit fees:</b> €${reservation.credit_fees}</p>

  <h3>👥 Guests</h3>
  <p><b>Adults:</b> ${reservation.guests_over}</p>
  <p><b>Children:</b> ${reservation.guests_under}</p>

  <h3>📞 Contact</h3>
  <p><b>Phone:</b> ${reservation.phone}</p>

  <h3>🏠 Billing Information</h3>
  <p><b>Name:</b> ${reservation.billing_name}</p>
  <p><b>Address:</b> ${reservation.billing_address}</p>
  <p><b>${reservation.billing_city}, ${reservation.billing_state}</b></p>
  <p><b>${reservation.billing_postal_code}, ${reservation.billing_country}</b></p>

  <hr />
  <p>The guest has now fully paid for their stay. No further action is required.</p>
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
  <h2>✅ Your Payment Has Been Successfully Received</h2>

  <p>Hello ${reservation.billing_name},</p>

  <p>We're pleased to let you know that your IBAN bank transfer has been validated and your payment has been fully processed.</p>

  <h3>📌 Reservation Details</h3>
  <p><b>Reservation ID:</b> ${reservation.id}</p>
  <p><b>Check-in:</b> ${reservation.start_date}</p>
  <p><b>Check-out:</b> ${reservation.end_date}</p>

  <h3>💶 Payment Confirmation</h3>
  <p><b>Total Amount Paid:</b> €${reservation.amount_paid}</p>
  <p>Your booking is now fully confirmed and no further action is required from you.</p>

  <h3>🏡 We Look Forward to Your Stay</h3>
  <p>Everything is now set for your upcoming visit. Prior to check-in, you'll receive additional details including arrival instructions and property information.</p>

  <p>If you have any questions in the meantime, feel free to reply to this email — we're here to help.</p>

  <hr />
  <p>Thank you for choosing to stay with us. We look forward to welcoming you soon!</p>
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
      <h2>🔒 Your Security Deposit Has Been Successfully Settled</h2>

      <p>Hello ${reservation.billing_name},</p>

      <p>We're pleased to inform you that your security deposit has been successfully processed and is now completed.</p>

      <h3>📌 Reservation Details</h3>
      <p><b>Reservation ID:</b> ${reservation.id}</p>
      <p><b>Check-in:</b> ${reservation.start_date}</p>
      <p><b>Check-out:</b> ${reservation.end_date}</p>

      <h3>💳 Deposit Information</h3>
      <p><b>Security deposit refunded amount:</b> €${reservation.security_deposit_refunded_amount}</p>

      <p>You can download a PDF copy of your invoice anytime from your account dashboard under the “Booking” section.</p>
      <p>If you have any questions or need assistance, simply reply to this email — we're always happy to help.</p>

      <hr />
      <p>Thank you for staying at Four Roses. We hope to have the pleasure of welcoming you back in the future.</p>

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
