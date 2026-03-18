import supabase from "../config/supabaseClient.js";
import Stripe from "stripe";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";

puppeteer.use(StealthPlugin());

// GET price for all months
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
  const lang = req.query.lang || "en";
  let browser;

  const translations = {
    en: {
      invoice: "Invoice",
      customerDetails: "Customer Details",
      name: "Name",
      email: "Email",
      phone: "Phone",
      billingAddress: "Billing Address",
      reservationInfo: "Reservation Information",
      reservationId: "Reservation ID",
      paymentMethod: "Payment Method",
      checkIn: "Check-in",
      checkOut: "Check-out",
      guests: "Guests",
      adults: "adults",
      children: "children",
      status: "Status",
      chargesSummary: "Charges Summary",
      description: "Description",
      amount: "Amount (€)",
      accommodationSubtotal: "Accommodation Subtotal",
      salesTax: "Sales Tax",
      touristTax: "Tourist Tax",
      creditFees: "Credit Card Fees",
      securityDeposit: "Security Deposit Charge",
      subtotal: "Subtotal",
      securityDepositRefunded: "Security Deposit Refunded",
      grandTotal: "Grand Total",
      footer: "Thank you for choosing Four Roses.",
      questions: "Questions?",
      contactUs: "Contact us",
      statusText: (status) => {
        const map = {
          confirmed: "Confirmed",
          paid: "Paid",
          completed: "Completed",
          cancelled: "Cancelled",
          pending: "Pending",
        };
        return map[status] || status;
      },
      paymentText: (type) => {
        const map = {
          "credit card": "Credit Card",
          iban: "IBAN",
        };
        return map[type?.toLowerCase()] || type;
      },
    },
    fr: {
      invoice: "Facture",
      customerDetails: "Détails du client",
      name: "Nom",
      email: "Email",
      phone: "Téléphone",
      billingAddress: "Adresse de facturation",
      reservationInfo: "Informations sur la réservation",
      reservationId: "ID de réservation",
      paymentMethod: "Méthode de paiement",
      checkIn: "Arrivée",
      checkOut: "Départ",
      guests: "Voyageurs",
      adults: "adultes",
      children: "enfants",
      status: "Statut",
      chargesSummary: "Récapitulatif des charges",
      description: "Description",
      amount: "Montant (€)",
      accommodationSubtotal: "Sous-total hébergement",
      salesTax: "TVA",
      touristTax: "Taxe de séjour",
      creditFees: "Frais de carte bancaire",
      securityDeposit: "Dépôt de garantie",
      subtotal: "Sous-total",
      securityDepositRefunded: "Dépôt de garantie remboursé",
      grandTotal: "Total général",
      footer: "Merci d'avoir choisi Four Roses.",
      questions: "Questions ?",
      contactUs: "Contactez-nous",
      statusText: (status) => {
        const map = {
          confirmed: "Confirmé",
          paid: "Payé",
          completed: "Terminé",
          cancelled: "Annulé",
          pending: "En attente",
        };
        return map[status] || status;
      },
      paymentText: (type) => {
        const map = {
          "credit card": "Carte de crédit",
          iban: "IBAN",
        };
        return map[type?.toLowerCase()] || type;
      },
    },
    es: {
      invoice: "Factura",
      customerDetails: "Datos del cliente",
      name: "Nombre",
      email: "Email",
      phone: "Teléfono",
      billingAddress: "Dirección de facturación",
      reservationInfo: "Información de la reserva",
      reservationId: "ID de reserva",
      paymentMethod: "Método de pago",
      checkIn: "Entrada",
      checkOut: "Salida",
      guests: "Huéspedes",
      adults: "adultos",
      children: "niños",
      status: "Estado",
      chargesSummary: "Resumen de cargos",
      description: "Descripción",
      amount: "Importe (€)",
      accommodationSubtotal: "Subtotal alojamiento",
      salesTax: "IVA",
      touristTax: "Tasa turística",
      creditFees: "Comisiones tarjeta",
      securityDeposit: "Cargo depósito de seguridad",
      subtotal: "Subtotal",
      securityDepositRefunded: "Depósito de seguridad reembolsado",
      grandTotal: "Total general",
      footer: "Gracias por elegir Four Roses.",
      questions: "¿Preguntas?",
      contactUs: "Contáctenos",
      statusText: (status) => {
        const map = {
          confirmed: "Confirmado",
          paid: "Pagado",
          completed: "Completado",
          cancelled: "Cancelado",
          pending: "Pendiente",
        };
        return map[status] || status;
      },
      paymentText: (type) => {
        const map = {
          "credit card": "Tarjeta de crédito",
          iban: "IBAN",
        };
        return map[type?.toLowerCase()] || type;
      },
    },
    de: {
      invoice: "Rechnung",
      customerDetails: "Kundendaten",
      name: "Name",
      email: "E-Mail",
      phone: "Telefon",
      billingAddress: "Rechnungsadresse",
      reservationInfo: "Reservierungsinformationen",
      reservationId: "Reservierungs-ID",
      paymentMethod: "Zahlungsmethode",
      checkIn: "Anreise",
      checkOut: "Abreise",
      guests: "Gäste",
      adults: "Erwachsene",
      children: "Kinder",
      status: "Status",
      chargesSummary: "Kostenübersicht",
      description: "Beschreibung",
      amount: "Betrag (€)",
      accommodationSubtotal: "Unterkunft Zwischensumme",
      salesTax: "Mehrwertsteuer",
      touristTax: "Kurtaxe",
      creditFees: "Kreditkartengebühren",
      securityDeposit: "Sicherheitsleistung",
      subtotal: "Zwischensumme",
      securityDepositRefunded: "Sicherheitsleistung erstattet",
      grandTotal: "Gesamtbetrag",
      footer: "Vielen Dank, dass Sie Four Roses gewählt haben.",
      questions: "Fragen?",
      contactUs: "Kontaktieren Sie uns",
      statusText: (status) => {
        const map = {
          confirmed: "Bestätigt",
          paid: "Bezahlt",
          completed: "Abgeschlossen",
          cancelled: "Storniert",
          pending: "Ausstehend",
        };
        return map[status] || status;
      },
      paymentText: (type) => {
        const map = {
          "credit card": "Kreditkarte",
          iban: "IBAN",
        };
        return map[type?.toLowerCase()] || type;
      },
    },
    pt: {
      invoice: "Fatura",
      customerDetails: "Dados do cliente",
      name: "Nome",
      email: "Email",
      phone: "Telefone",
      billingAddress: "Morada de faturação",
      reservationInfo: "Informações da reserva",
      reservationId: "ID da reserva",
      paymentMethod: "Método de pagamento",
      checkIn: "Entrada",
      checkOut: "Saída",
      guests: "Hóspedes",
      adults: "adultos",
      children: "crianças",
      status: "Estado",
      chargesSummary: "Resumo de encargos",
      description: "Descrição",
      amount: "Valor (€)",
      accommodationSubtotal: "Subtotal alojamento",
      salesTax: "IVA",
      touristTax: "Taxa turística",
      creditFees: "Taxas de cartão de crédito",
      securityDeposit: "Depósito de segurança",
      subtotal: "Subtotal",
      securityDepositRefunded: "Depósito de segurança reembolsado",
      grandTotal: "Total geral",
      footer: "Obrigado por escolher Four Roses.",
      questions: "Questões?",
      contactUs: "Contacte-nos",
      statusText: (status) => {
        const map = {
          confirmed: "Confirmado",
          paid: "Pago",
          completed: "Concluído",
          cancelled: "Cancelado",
          pending: "Pendente",
        };
        return map[status] || status;
      },
      paymentText: (type) => {
        const map = {
          "credit card": "Cartão de crédito",
          iban: "IBAN",
        };
        return map[type?.toLowerCase()] || type;
      },
    },
    nl: {
      invoice: "Factuur",
      customerDetails: "Klantgegevens",
      name: "Naam",
      email: "E-mail",
      phone: "Telefoon",
      billingAddress: "Factuuradres",
      reservationInfo: "Reserveringsinformatie",
      reservationId: "Reserverings-ID",
      paymentMethod: "Betaalmethode",
      checkIn: "Inchecken",
      checkOut: "Uitchecken",
      guests: "Gasten",
      adults: "volwassenen",
      children: "kinderen",
      status: "Status",
      chargesSummary: "Kostenopzicht",
      description: "Omschrijving",
      amount: "Bedrag (€)",
      accommodationSubtotal: "Subtotaal accommodatie",
      salesTax: "BTW",
      touristTax: "Toeristenbelasting",
      creditFees: "Creditcardkosten",
      securityDeposit: "Borg",
      subtotal: "Subtotaal",
      securityDepositRefunded: "Borg terugbetaald",
      grandTotal: "Totaalbedrag",
      footer: "Bedankt voor het kiezen van Four Roses.",
      questions: "Vragen?",
      contactUs: "Neem contact op",
      statusText: (status) => {
        const map = {
          confirmed: "Bevestigd",
          paid: "Betaald",
          completed: "Voltooid",
          cancelled: "Geannuleerd",
          pending: "In behandeling",
        };
        return map[status] || status;
      },
      paymentText: (type) => {
        const map = {
          "credit card": "Creditcard",
          iban: "IBAN",
        };
        return map[type?.toLowerCase()] || type;
      },
    },
  };

  const tr = translations[lang] || translations.en;

  // Load logo as Base64 for PDF usage
  const logoPath = path.resolve("assets/logo/4RosesHeader.png");
  const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });

  try {
    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !reservation) {
      console.error(`[PDF] Reservation not found: ${id}`);
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
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #f5ede4;
      color: #2c2420;
      padding: 1px 24px 8px;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 780px;
      margin: auto;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border: 1px solid #ede5db;
      border-radius: 16px;
      padding: 28px 36px;
      margin-bottom: 15px;
      box-shadow: 0 4px 20px rgba(139,69,19,0.07);
    }

    .logo { max-width: 130px; }

    .invoice-meta { text-align: right; }

    .invoice-number {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 26px;
      font-weight: 600;
      color: #8b4513;
      letter-spacing: 0.03em;
    }

    .invoice-label {
      font-size: 11px;
      color: #9e8a80;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    /* ── Two column ── */
    .two-column {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }

    .col-box {
      flex: 1;
      background: #ffffff;
      border: 1px solid #ede5db;
      border-radius: 12px;
      padding: 24px 28px;
      box-shadow: 0 2px 12px rgba(139,69,19,0.05);
    }

    .section-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 16px;
      font-weight: 600;
      color: #8b4513;
      letter-spacing: 0.04em;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ede5db;
    }

    .col-box p {
      font-size: 13px;
      color: #4a3830;
      line-height: 1.9;
    }

    .col-box p strong {
      color: #2c2420;
      font-weight: 500;
      min-width: 90px;
      display: inline-block;
    }

    /* ── Reservation box ── */
    .reservation-box {
      background: #ffffff;
      border: 1px solid #ede5db;
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 15px;
      box-shadow: 0 2px 12px rgba(139,69,19,0.05);
    }

    .reservation-box p {
      font-size: 13px;
      color: #4a3830;
      line-height: 1.9;
    }

    .reservation-box p strong {
      color: #2c2420;
      font-weight: 500;
      min-width: 140px;
      display: inline-block;
    }

    /* ── Status badge ── */
    .status-badge {
      display: inline-block;
      background: #f0faf3;
      color: #2d7a4f;
      border: 1px solid #a8dbb9;
      border-radius: 20px;
      padding: 2px 12px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    /* ── Charges table ── */
    .charges-box {
      background: #ffffff;
      border: 1px solid #ede5db;
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 0px;
      box-shadow: 0 2px 12px rgba(139,69,19,0.05);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }

    thead tr {
      background: #fdf8f3;
    }

    th {
      padding: 11px 14px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #9e8a80;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-bottom: 1px solid #ede5db;
    }

    td {
      padding: 11px 14px;
      font-size: 13px;
      color: #4a3830;
      border-bottom: 1px solid #f5ede4;
    }

    tr:last-child td { border-bottom: none; }

    .subtotal-row td {
      font-weight: 600;
      color: #2c2420;
      background: #fdf8f3;
      border-top: 1px solid #ede5db;
      border-bottom: 1px solid #ede5db;
    }

    .total-row td {
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      background: #8b4513;
    }

    .total-row td:first-child {
      border-radius: 0 0 0 8px;
    }

    .total-row td:last-child {
      border-radius: 0 0 8px 0;
    }

    .amount { text-align: right; }

    /* ── Footer ── */
    .footer-note {
      text-align: center;
      font-size: 12px;
      color: #9e8a80;
      margin-top: 0px;
      border-top: 1px solid #ede5db;
    }

    .footer-note a { color: #8b4513; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">

    <!-- HEADER -->
    <div class="header">
      <img class="logo" src="data:image/png;base64,${logoBase64}" alt="Logo" />
      <div class="invoice-meta">
        <div class="invoice-label">${tr.invoice}</div>
        <div class="invoice-number">#${invoiceData.invoice_number}</div>
        <div style="font-size: 12px; color: #9e8a80; margin-top: 4px;">${
          invoiceData.date_issued
        }</div>
      </div>
    </div>

    <!-- CUSTOMER + BILLING -->
    <div class="two-column">

      <div class="col-box">
        <div class="section-title">${tr.customerDetails}</div>
        <p><strong>${tr.name}</strong>${invoiceData.customer_name}</p>
        <p><strong>${tr.email}</strong>${invoiceData.customer_email}</p>
        <p><strong>${tr.phone}</strong>${invoiceData.phone}</p>
      </div>

      <div class="col-box">
        <div class="section-title">${tr.billingAddress}</div>
        <p>${invoiceData.billing.name}</p>
        <p>${invoiceData.billing.address}</p>
        <p>${invoiceData.billing.city}, ${invoiceData.billing.state}</p>
        <p>${invoiceData.billing.postal}</p>
        <p>${invoiceData.billing.country}</p>
      </div>

    </div>

    <!-- RESERVATION INFO -->
    <div class="reservation-box">
      <div class="section-title">${tr.reservationInfo}</div>
      <p><strong>${tr.reservationId}</strong>${invoiceData.reservation_id}</p>
      <p><strong>${tr.paymentMethod}</strong>${tr.paymentText(invoiceData.payment_method)}</p>
      <p><strong>${tr.checkIn}</strong>${invoiceData.check_in}</p>
      <p><strong>${tr.checkOut}</strong>${invoiceData.check_out}</p>
      <p><strong>${tr.guests}</strong>${invoiceData.guests_over} ${tr.adults}, ${
      invoiceData.guests_under
    } ${tr.children}</p>
      <p><strong>${tr.status}</strong><span class="status-badge">${tr.statusText(
      invoiceData.status
    )}</span></p>
    </div>

    <!-- CHARGES SUMMARY -->
    <div class="charges-box">
      <div class="section-title">${tr.chargesSummary}</div>

      <table>
        <thead>
          <tr>
            <th>${tr.description}</th>
            <th class="amount">${tr.amount}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>${tr.accommodationSubtotal}</td><td class="amount">${
      invoiceData.accommodation_subtotal
    }</td></tr>
          <tr><td>${tr.salesTax}</td><td class="amount">${invoiceData.sales_tax}</td></tr>
          <tr><td>${tr.touristTax}</td><td class="amount">${invoiceData.tourist_tax}</td></tr>
          <tr><td>${tr.creditFees}</td><td class="amount">${invoiceData.credit_fees}</td></tr>
          <tr><td>${tr.securityDeposit}</td><td class="amount">${
      invoiceData.security_deposit_charge
    }</td></tr>
          <tr class="subtotal-row"><td>${tr.subtotal}</td><td class="amount">${
      invoiceData.subtotal
    }</td></tr>
          <tr><td>${tr.securityDepositRefunded}</td><td class="amount">− ${
      invoiceData.security_deposit_refunded_amount
    }</td></tr>
          <tr class="total-row"><td>${tr.grandTotal}</td><td class="amount">${
      invoiceData.total
    }</td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer-note">
      ${tr.footer} &nbsp;·&nbsp; ${tr.questions}
      <a href="mailto:support@4roses.ca">${tr.contactUs}</a>
    </div>

  </div>
</body>
</html>
    `;

    const isLocal = process.env.NODE_ENV === "development";
    // ---------------------------------------------------------
    // PDF GENERATION - Launch browser (puppeteer handles downloading automatically)
    // ---------------------------------------------------------
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      executablePath: isLocal ? puppeteer.executablePath() : "/usr/bin/google-chrome-stable",
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
    console.error("========== PDF GENERATION ERROR ==========");
    console.error("Error Message:", err.message);
    console.error("Error Code:", err.code);
    console.error("Error Name:", err.name);
    console.error("Stack:", err.stack);
    console.error("==========================================");

    res.status(500).json({
      error: "Failed to generate invoice.",
      details: err.message,
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("Error closing browser:", e.message);
      }
    }
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const {
      id,
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

    if (!id || !user_id || !amount_paid) {
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
        id: id,
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
        type: "initialize_deposit",
      },
      description: `Initial deposit for booking #${id}`,
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

// GET all price overrides
export const getPriceOverrides = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("price_overrides")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST new price override
export const addPriceOverride = async (req, res, next) => {
  try {
    const { start_date, end_date, price_per_night, account_id } = req.body;
    const { data, error } = await supabase
      .from("price_overrides")
      .insert({ start_date, end_date, price_per_night, account_id: account_id ?? null })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// DELETE price override by id
export const deletePriceOverride = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("price_overrides").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
