import supabase from "../config/supabaseClient.js";
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
    const { data: reservations, error: resError } = await supabase
      .from("reservations")
      .select("id, start_date, end_date, billing_name, status")
      .in("status", ["confirmed", "paid", "completed"]);

    if (resError) throw resError;

    // Fetch manually blocked days
    const { data: blockedDays, error: blockError } = await supabase
      .from("blocked_days")
      .select("id, start_date, end_date");

    if (blockError) throw blockError;

    // Build iCal content
    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//4Roses//Calendar Sync//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    reservations.forEach((r) => {
      const dtStart = dayjs(r.start_date).format("YYYYMMDD");
      // iCal DTEND for all-day events is exclusive, so add 1 day
      const dtEnd = dayjs(r.end_date).add(1, "day").format("YYYYMMDD");

      ical += `
BEGIN:VEVENT
UID:reservation-${r.id}@4roses.fignet.ca
DTSTAMP:${dayjs().format("YYYYMMDDTHHmmss")}Z
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
SUMMARY:Reservation - ${r.billing_name || "Guest"}
DESCRIPTION:Blocked (Reservation ID ${r.id})
END:VEVENT
`;
    });

    blockedDays.forEach((b) => {
      const dtStart = dayjs(b.start_date).format("YYYYMMDD");
      // blocked days don't require an extra day for cleanup.
      const dtEnd = dayjs(b.end_date).format("YYYYMMDD");

      ical += `
BEGIN:VEVENT
UID:blocked-${b.id}@4roses.fignet.ca
DTSTAMP:${dayjs().format("YYYYMMDDTHHmmss")}Z
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
SUMMARY:Blocked
DESCRIPTION:Manually blocked dates
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

// GET check if reservation isn't already confirmed
// /check/:check_in/:check_out
export const checkReservation = async (req, res, next) => {
  const { check_in, check_out } = req.params;

  try {
    const { data: existing, error } = await supabase
      .from("reservations")
      .select("*")
      .in("status", ["confirmed", "paid", "completed"])
      .or(`and(start_date.lte.${check_out}, end_date.gte.${check_in})`);

    if (error) throw error;

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

async function waitForReservation(paymentIntentId, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .contains("payment_intent", [paymentIntentId])
      .maybeSingle();

    if (data) return data; // Found it!
    await new Promise((r) => setTimeout(r, 500)); // Wait 0.5s
  }

  throw new Error("Timed out waiting for webhook to store reservation.");
}

// GET reservation data by id
// /booking/:id
export const getReservationData = async (req, res, next) => {
  const { id } = req.params;

  let bookingData = {};

  try {
    // Try to get by reservation id first
    const { data: bookingDataById, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      bookingData = bookingDataById;
    } else {
      // Fallback: wait for webhook to store reservation by payment intent
      bookingData = await waitForReservation(id);
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
        guests_under,
        guests_over,
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
      id,
      user_id,
      start_date,
      end_date,
      accommodation_subtotal,
      sales_tax,
      tourist_tax,
      total_price,
      amount_paid,
      guests_over,
      guests_under,
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
      !id ||
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
          id,
          user_id,
          start_date,
          end_date,
          accommodation_subtotal,
          sales_tax,
          tourist_tax,
          total_price,
          amount_paid,
          payment_method,
          guests_over,
          guests_under,
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
  const { status, paid, start_date, end_date } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Reservation ID is required" });
  }

  if (!start_date || !end_date) {
    return res.status(400).json({ error: "Check-in and check-out dates are required" });
  }

  try {
    if (status == "confirmed" || status == "completed" || status == "paid") {
      // Check for conflicting reservations
      const { data: existing, error: conflictError } = await supabase
        .from("reservations")
        .select("*")
        .neq("id", id)
        .in("status", ["confirmed", "paid", "completed"])
        .or(`and(start_date.lte.${end_date}, end_date.gte.${start_date})`);

      if (conflictError) {
        console.error("Supabase conflict query error:", conflictError);
        return res.status(500).json({ error: "Failed to check date conflicts" });
      }

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: "Dates already booked" });
      }
    }

    // Update the reservation
    const { data, error: updateError } = await supabase
      .from("reservations")
      .update({ status, ...(status === "paid" && { amount_paid: paid }) })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return res.status(500).json({ error: "Failed to update reservation" });
    }

    return res.json({ success: true, updated: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const settleSecurityDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const { id } = req.params;

    // Save to database
    const { data: updated } = await supabase
      .from("reservations")
      .update({
        security_deposit_refunded: true,
        security_deposit_refunded_amount: amount,
        status: "completed",
      })
      .eq("id", id)
      .select()
      .single();

    res.json({ success: true, reservation: updated });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const deleteReservation = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check if reservation exists
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Prevent deleting non-pending reservations
    if (reservation.status !== "pending" && reservation.status !== "cancelled") {
      return res
        .status(400)
        .json({ error: "Only pending or cancelled reservations can be deleted" });
    }

    // Delete the reservation
    const { error: deleteError } = await supabase.from("reservations").delete().eq("id", id);

    if (deleteError) {
      return res.status(500).json({ error: "Failed to delete reservation" });
    }

    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    console.error("Error deleting reservation:", err);
    next(err);
  }
};
