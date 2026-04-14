import supabase from "../config/supabaseClient.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL;
const currentYear = new Date().getFullYear();

/* 
// Sends the user a verification email. The user must click on the link provided to be allowed to login to their account.
//
// POST {id, link}:
// id:   The Id number of the user.
// link: The link the user will have to click to verify that hes the user
//
// POST email/sendEmailVerification
*/
export const sendVerificationEmail = async (req, res, next) => {
  const { id, link } = req.body;

  try {
    // Get account information
    const { data: userInfo, error: reqError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (reqError) throw reqError;

    // Get the user's email
    const { data: authUserInfo } = await supabase.auth.admin.getUserById(id);
    const customerEmail = authUserInfo.user.email;

    const emailTranslations = {
      en: {
        subject: "Confirm your email to activate your Four Roses account",
        eyebrow: "Account Confirmation",
        title: "One step away from your <em>first booking.</em>",
        welcome: (email) =>
          `Welcome ${email}! <br>We're delighted to have you. Please confirm your email address to activate your account and start exploring our available reservations.`,
        expiry:
          "This link is valid for <strong>24 hours</strong>. If you didn't create an account with Four Roses, you can safely ignore this email.",
        cta: "Confirm My Email",
        account: "Account",
        linkExpires: "Link Expires",
        expiresValue: "1 hr",
        fallback: "Button not working? Copy and paste this link into your browser:",
        contact: "Questions? Contact us at",
        footer: "© 2026 Four Roses. All rights reserved.",
        terms: "Terms of Service",
      },

      fr: {
        subject: "Confirmez votre email pour activer votre compte Four Roses",
        eyebrow: "Confirmation du compte",
        title: "Plus qu'une étape avant votre <em>première réservation.</em>",
        welcome: (email) =>
          `Bienvenue ${email}! <br>Nous sommes ravis de vous accueillir. Veuillez confirmer votre adresse e-mail pour activer votre compte et commencer à explorer nos réservations disponibles.`,
        expiry:
          "Ce lien est valable pendant <strong>24 heures</strong>. Si vous n'avez pas créé de compte chez Four Roses, vous pouvez ignorer cet e-mail.",
        cta: "Confirmer mon e-mail",
        account: "Compte",
        linkExpires: "Expiration du lien",
        expiresValue: "1 h",
        fallback: "Le bouton ne fonctionne pas ? Copiez et collez ce lien dans votre navigateur :",
        contact: "Des questions ? Contactez-nous à",
        footer: "© 2026 Four Roses. Tous droits réservés.",
        terms: "Conditions d'utilisation",
      },

      es: {
        subject: "Confirma tu correo electrónico para activar tu cuenta de Four Roses",
        eyebrow: "Confirmación de cuenta",
        title: "A un paso de tu <em>primera reserva.</em>",
        welcome: (email) =>
          `¡Bienvenido ${email}! <br>Nos alegra tenerte con nosotros. Por favor confirma tu correo electrónico para activar tu cuenta y comenzar a explorar nuestras reservas disponibles.`,
        expiry:
          "Este enlace es válido durante <strong>24 horas</strong>. Si no creaste una cuenta en Four Roses, puedes ignorar este correo.",
        cta: "Confirmar mi correo",
        account: "Cuenta",
        linkExpires: "Expira",
        expiresValue: "1 h",
        fallback: "¿El botón no funciona? Copia y pega este enlace en tu navegador:",
        contact: "¿Preguntas? Contáctanos en",
        footer: "© 2026 Four Roses. Todos los derechos reservados.",
        terms: "Términos del servicio",
      },

      de: {
        subject: "Bestätigen Sie Ihre E-Mail, um Ihr Four Roses-Konto zu aktivieren",
        eyebrow: "Kontobestätigung",
        title: "Nur noch ein Schritt zu Ihrer <em>ersten Buchung.</em>",
        welcome: (email) =>
          `Willkommen ${email}! <br>Wir freuen uns, Sie bei uns zu haben. Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren und unsere verfügbaren Reservierungen zu entdecken.`,
        expiry:
          "Dieser Link ist <strong>24 Stunden</strong> gültig. Falls Sie kein Konto bei Four Roses erstellt haben, können Sie diese E-Mail ignorieren.",
        cta: "E-Mail bestätigen",
        account: "Konto",
        linkExpires: "Link läuft ab",
        expiresValue: "24 Std.",
        fallback: "Funktioniert der Button nicht? Kopieren Sie diesen Link in Ihren Browser:",
        contact: "Fragen? Kontaktieren Sie uns unter",
        footer: "© 2026 Four Roses. Alle Rechte vorbehalten.",
        terms: "Nutzungsbedingungen",
      },

      pt: {
        subject: "Confirme seu e-mail para ativar sua conta Four Roses",
        eyebrow: "Confirmação de conta",
        title: "Falta apenas um passo para a sua <em>primeira reserva.</em>",
        welcome: (email) =>
          `Bem-vindo ${email}! <br>Estamos felizes por tê-lo conosco. Confirme o seu e-mail para ativar a sua conta e começar a explorar as nossas reservas disponíveis.`,
        expiry:
          "Este link é válido por <strong>24 horas</strong>. Se não criou uma conta na Four Roses, pode ignorar este e-mail.",
        cta: "Confirmar e-mail",
        account: "Conta",
        linkExpires: "Expira em",
        expiresValue: "1 h",
        fallback: "O botão não funciona? Copie e cole este link no seu navegador:",
        contact: "Dúvidas? Contacte-nos em",
        footer: "© 2026 Four Roses. Todos os direitos reservados.",
        terms: "Termos de serviço",
      },

      nl: {
        subject: "Bevestig uw e-mail om uw Four Roses-account te activeren",
        eyebrow: "Accountbevestiging",
        title: "Nog één stap verwijderd van je <em>eerste boeking.</em>",
        welcome: (email) =>
          `Welkom ${email}! <br>We zijn blij dat je er bent. Bevestig je e-mailadres om je account te activeren en onze beschikbare reserveringen te bekijken.`,
        expiry:
          "Deze link is <strong>24 uur</strong> geldig. Als je geen account hebt aangemaakt bij Four Roses, kun je deze e-mail negeren.",
        cta: "Bevestig mijn e-mail",
        account: "Account",
        linkExpires: "Verloopt",
        expiresValue: "1 u",
        fallback: "Werkt de knop niet? Kopieer en plak deze link in je browser:",
        contact: "Vragen? Neem contact op via",
        footer: "© 2026 Four Roses. Alle rechten voorbehouden.",
        terms: "Servicevoorwaarden",
      },
    };

    const tr = emailTranslations[userInfo.preferred_language] || emailTranslations.en;

    try {
      const response = await resend.emails.send({
        from: `Four Roses Registration <Registration@fourroses.fignet.ca>`,
        to: customerEmail,
        subject: tr.subject,
        reply_to: adminEmail,
        html: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm Your Signup — Four Roses</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #f5f0eb;
      font-family: 'Jost', sans-serif;
      color: #2c2420;
      padding: 48px 16px;
    }

    .wrapper {
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(100, 60, 40, 0.10), 0 1px 4px rgba(100, 60, 40, 0.07);
    }

    /* Header */
    .header {
      background: #fff;
      padding: 36px 52px 28px;
      border-bottom: 1px solid #ede5db;
      text-align: center;
      position: relative;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 52px;
      right: 52px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #c9a96e 30%, #e8c98a 50%, #c9a96e 70%, transparent);
    }

    .logo-img {
      height: 52px;
      width: auto;
      display: block;
      margin: 0 auto;
    }

    .rose-row {
      text-align: center;
      padding: 20px 0 0;
      letter-spacing: 0.3em;
      font-size: 15px;
      color: #c9846e;
    }

    /* Body */
    .body {
      padding: 44px 52px 40px;
    }

    .eyebrow {
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #c9a96e;
      margin-bottom: 16px;
    }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 40px;
      font-weight: 600;
      line-height: 1.12;
      color: #1e1612;
      margin-bottom: 22px;
    }

    h1 em {
      font-style: italic;
      font-weight: 400;
      color: #8b4513;
    }

    p {
      font-size: 14.5px;
      line-height: 1.75;
      color: #6b5a52;
      margin-bottom: 16px;
      font-weight: 300;
    }

    strong {
      font-weight: 500;
      color: #2c2420;
    }

    /* CTA Button — all states locked to terracotta */
    .cta-wrap {
      margin: 36px 0 32px;
      text-align: center;
    }

    .cta,
    .cta:link,
    .cta:visited,
    .cta:hover,
    .cta:active {
      display: inline-block;
      background: #8b4513;
      color: #fff !important;
      text-decoration: none;
      font-family: 'Jost', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 17px 48px;
      border-radius: 2px;
    }

    .cta:hover {
      background: #a0521a;
    }

    /* Info strip */
    .info-strip {
      display: flex;
      border: 1px solid #ede5db;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 28px;
      background: #fdf8f3;
    }

    /* Default styling for all items */
    .info-item {
      padding: 18px 16px;
      text-align: center;
      border-right: 1px solid #ede5db;
    }

    /* Remove border for last item */
    .info-item:last-child {
      border-right: none;
    }

    /* Make email take more space */
    .email-item {
      flex: 3;
      /* email gets 3 parts */
      text-align: left;
      /* optional, aligns text nicely */
      word-break: break-word;
      /* avoid overflow */
    }

    /* Smaller flex for the "Link Expires" */
    .expires-item {
      flex: 1;
      /* link expires takes 1 part */
    }

    /* Label and value styling */
    .info-item .label {
      font-size: 8.5px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #b0978a;
      margin-bottom: 6px;
    }

    .info-item .value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px;
      color: #2c2420;
      word-break: break-word;
    }

    /* Fallback link */
    .fallback {
      background: #fdf8f3;
      border: 1px solid #ede5db;
      border-radius: 4px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }

    .fallback p {
      font-size: 11.5px;
      margin-bottom: 7px;
      color: #9e8a80;
    }

    .fallback code {
      font-family: 'Courier New', monospace;
      font-size: 10.5px;
      color: #8b4513;
      word-break: break-all;
    }

    /* Divider */
    .divider {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, #ede5db 20%, #ede5db 80%, transparent);
      margin: 28px 0;
    }

    /* Contact note — all link states */
    .contact-note {
      font-size: 12.5px;
      color: #9e8a80;
    }

    .contact-note a:link,
    .contact-note a:visited,
    .contact-note a:hover,
    .contact-note a:active {
      color: #8b4513;
      text-decoration: none;
      border-bottom: 1px solid #c9846e;
      padding-bottom: 1px;
    }

    .contact-note a:hover {
      color: #a0521a;
      border-bottom-color: #8b4513;
    }

    /* Footer */
    .footer {
      background: #fdf8f3;
      border-top: 1px solid #ede5db;
      padding: 24px 52px;
      text-align: center;
    }

    .footer p {
      font-size: 10.5px;
      color: #b8a89e;
      margin-bottom: 5px;
      line-height: 1.6;
    }

    .footer a:link,
    .footer a:visited,
    .footer a:hover,
    .footer a:active {
      color: #a07060;
      text-decoration: none;
      border-bottom: 1px solid #d4b8aa;
      padding-bottom: 1px;
    }

    .footer a:hover {
      color: #8b4513;
      border-bottom-color: #8b4513;
    }

    @media (max-width: 480px) {

      .header,
      .body,
      .footer {
        padding-left: 28px;
        padding-right: 28px;
      }

      h1 {
        font-size: 32px;
      }

      .info-strip {
        flex-direction: column;
      }

      .info-item {
        border-right: none;
        border-bottom: 1px solid #ede5db;
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .logo-img {
        height: 40px;
      }
    }
  </style>
</head>

<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <img src="${
        process.env.FRONTEND_URL
      }/images/4RosesHeader.png" alt="Four Roses" class="logo-img" />
      <div class="rose-row">✦ ✦ ✦ ✦</div>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="eyebrow">${tr.eyebrow}</p>
      <h1>${tr.title}</h1>

      <p>
        ${tr.welcome(userInfo.full_name)}
      </p>
      <p>
        ${tr.expiry}
      </p>

      <!-- CTA -->
      <div class="cta-wrap">
        <a href="${link}" class="cta">${tr.cta}</a>
      </div>

      <!-- Info strip -->
      <div class="info-strip">
        <div class="info-item email-item">
          <div class="label">${tr.account}</div>
          <div class="value">${customerEmail}</div>
        </div>
        <div class="info-item expires-item">
          <div class="label">${tr.linkExpires}</div>
          <div class="value">${tr.expiresValue}</div>
        </div>
      </div>

      <!-- Fallback link -->
      <div class="fallback">
        <p>${tr.fallback}</p>
        <code>${link}</code>
      </div>

      <hr class="divider" />

      <p class="contact-note">
        ${tr.contact}
        <a href="mailto:contact@fourroses.fignet.ca">contact@fourroses.fignet.ca</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>${tr.footer}</p>
      <p><a href="${process.env.FRONTEND_URL}/terms-and-conditions">${tr.terms}</a></p>
    </div>

  </div>
</body>

</html>`,
      });

      res.status(200).json({ success: true, response });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send email" });
    }
  } catch (err) {
    next(err);
  }
};

/*
// Sends an email to the admin/site owner written by a user with a request for contact.
//
// POST {name, email, subject, message}:
// name:    The name of the person sending the email. 
// email:   The email address that the reciver will reply to.
// subject: The subject of the email, specified by the user.
// message: The reason for contact by the user.
//
// translation isnt required here.
// POST email/contact
*/
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
      <p style="margin-top:6px;">© ${currentYear} Four Roses · All rights reserved</p>
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

/*
// Sends an email to the admin/site owner whenever a new booking has been made.
// Fetches the booking infromation with the reservation id and sends a summary of the booking.
// When the payment_method is IBAN it servers as a reminder for the owner to check their bank statements to reserve the booking.
// When the payment_method is credit_card it shows the owner that a reservation has already been booked and reserved.
// 
// POST {reservation_id}:
// reservation_id: The reservation id which holds all the booking details.
// 
// translation isnt required here.
// POST email/initializeBooking
*/
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Booking Initialized</title>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    /* ─── Outer Layout ─── */

    .outer {
      background-color: #f0ece4;
      width: 100%;
    }

    .wrapper {
      max-width: 620px;
      width: 100%;
      margin: 0 auto;
    }

    /* ─── Header ─── */

    .header {
      background: linear-gradient(160deg, #8b4513 0%, #b85c2a 100%);
      border-radius: 16px 16px 0 0;
      padding: 36px 48px 32px;
      text-align: center;
    }

    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 100px;
      margin-bottom: 18px;
    }

    .header-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: #fff;
      line-height: 1.3;
      margin-bottom: 8px;
      text-shadow: 0 1px 6px rgba(80, 20, 0, 0.3);
    }

    .header-sub {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      font-weight: 300;
    }

    /* ─── Body ─── */

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
      background: #fdf6f0;
      border-left: 3px solid #8b4513;
      border-radius: 0 8px 8px 0;
    }

    /* ─── Section Label ─── */

    .section-label {
      display: block;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #8b4513;
      margin-top: 28px;
      margin-bottom: 12px;
    }

    /* ─── Detail Table ─── */

    .detail-table {
      width: 100%;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .detail-table td {
      padding: 13px 20px;
    }

    .detail-table tr + tr td {
      border-top: 1px solid #f0ece4;
    }

    .td-label {
      font-size: 12px;
      color: #9c8e82;
      font-weight: 400;
    }

    .td-value {
      font-size: 13px;
      color: #2c2825;
      font-weight: 500;
      text-align: right;
    }

    /* ─── Status Pill ─── */

    .status-pill {
      display: inline-block;
      background: #fdf0e8;
      color: #8b4513;
      font-size: 11px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 20px;
    }

    /* ─── Pricing Hero ─── */

    .pricing-hero {
      width: 100%;
      background: linear-gradient(160deg, #8b4513 0%, #b85c2a 100%);
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 10px;
    }

    .pricing-hero td {
      padding: 22px 24px;
      vertical-align: middle;
    }

    .pricing-label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 5px;
    }

    .pricing-amount {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      color: #fff;
      font-weight: 600;
      text-shadow: 0 1px 4px rgba(80, 20, 0, 0.2);
    }

    .pricing-right {
      text-align: right;
    }

    .pricing-method {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 6px;
    }

    .paid-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 12px;
      color: #fff;
      font-weight: 500;
    }

    .paid-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #fff;
      margin-right: 5px;
      vertical-align: middle;
    }

    /* ─── Breakdown Table ─── */

    .breakdown-table {
      width: 100%;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .breakdown-table td {
      padding: 12px 20px;
      font-size: 13px;
    }

    .breakdown-table tr + tr td {
      border-top: 1px solid #f0ece4;
    }

    .breakdown-table tr:last-child {
      background: #faf8f5;
    }

    .b-label {
      color: #9c8e82;
    }

    .b-value {
      color: #2c2825;
      font-weight: 500;
      text-align: right;
    }

    /* ─── Two-Column Layout ─── */

    .two-col-outer {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .two-col-outer td {
      vertical-align: top;
    }

    .col-gap {
      width: 2%;
    }

    /* ─── Address Block ─── */

    .address-table {
      width: 100%;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .address-table td {
      padding: 16px 20px;
      font-size: 13px;
      line-height: 1.8;
      color: #2c2825;
    }

    .address-name {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .address-addr {
      color: #7a6e64;
    }

    /* ─── Divider ─── */

    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    /* ─── Final Note ─── */

    .final-note {
      font-size: 13px;
      line-height: 1.7;
      color: #7a6e64;
      text-align: center;
    }

    /* ─── Footer ─── */

    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 22px 48px;
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer-text + .footer-text {
      margin-top: 6px;
    }

    .footer-brand {
      color: #5c524a;
      font-weight: 500;
    }
  </style>

</head>

<body>

  <table class="outer" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table class="wrapper" cellpadding="0" cellspacing="0" border="0">

          <!-- ─── HEADER ─── -->
          <tr>
            <td class="header">
              <div class="header-badge">🆕 New Booking</div>
              <div class="header-title">A Reservation Has Been Initialized</div>
              <div class="header-sub">Someone has begun their booking — review the details below.</div>
            </td>
          </tr>

          <!-- ─── BODY ─── -->
          <tr>
            <td class="body">

              <!-- Intro -->
              <div class="intro">
                A new reservation has been initialized. This is an internal notification to keep you up to date on incoming bookings.
              </div>

              <!-- Reservation Details -->
              <span class="section-label">Reservation Details</span>

              <table class="detail-table" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="td-label">Reservation ID</td>
                  <td class="td-value">${reservation.id}</td>
                </tr>
                <tr>
                  <td class="td-label">Status</td>
                  <td class="td-value">
                    <span class="status-pill">${reservation.status}</span>
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Created</td>
                  <td class="td-value">${reservation.created_at}</td>
                </tr>
                <tr>
                  <td class="td-label">Check-in</td>
                  <td class="td-value">${reservation.start_date}</td>
                </tr>
                <tr>
                  <td class="td-label">Check-out</td>
                  <td class="td-value">${reservation.end_date}</td>
                </tr>
              </table>

              <!-- Pricing -->
              <span class="section-label">Pricing</span>

              <table class="pricing-hero" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div class="pricing-label">Total Price</div>
                    <div class="pricing-amount">€ ${reservation.total_price}</div>
                  </td>
                  <td class="pricing-right">
                    <div class="pricing-method">${reservation.payment_method}</div>
                    <div class="paid-badge">
                      <span class="paid-dot"></span>
                      € ${reservation.amount_paid} ${
      reservation.payment_method == "iban" ? "to confirm" : "confirmed"
    }
                    </div>
                  </td>
                </tr>
              </table>

              <table class="breakdown-table" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="b-label">Accommodation Subtotal</td>
                  <td class="b-value">€ ${reservation.accommodation_subtotal}</td>
                </tr>
                <tr>
                  <td class="b-label">Sales Tax</td>
                  <td class="b-value">€ ${reservation.sales_tax}</td>
                </tr>
                <tr>
                  <td class="b-label">Tourist Tax</td>
                  <td class="b-value">€ ${reservation.tourist_tax}</td>
                </tr>
              </table>

              <!-- Guests & Contact -->
              <span class="section-label">Guests & Contact</span>

              <table class="two-col-outer" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="49%">
                    <table class="detail-table" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="td-label">Adults</td>
                        <td class="td-value">${reservation.guests_over}</td>
                      </tr>
                      <tr>
                        <td class="td-label">Children</td>
                        <td class="td-value">${reservation.guests_under}</td>
                      </tr>
                    </table>
                  </td>
                  <td class="col-gap"></td>
                  <td width="49%">
                    <table class="detail-table" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="td-label">Phone</td>
                        <td class="td-value">${reservation.phone}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Billing Information -->
              <span class="section-label">Billing Information</span>

              <table class="address-table" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div class="address-name">${reservation.billing_name}</div>
                    <div class="address-addr">
                      ${reservation.billing_address}<br />
                      ${reservation.billing_city}, ${reservation.billing_state}<br />
                      ${reservation.billing_postal_code}, ${reservation.billing_country}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr class="divider" />

              <!-- Final Note -->
              <p class="final-note">
                This email notifies you that someone has begun their booking. Monitor the reservation for completion.
              </p>

            </td>
          </tr>

          <!-- ─── FOOTER ─── -->
          <tr>
            <td class="footer">
              <p class="footer-text">
                <span class="footer-brand">Four Roses</span> · Internal Notification
              </p>
              <p class="footer-text">© ${currentYear} Four Roses · All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

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

/*
// Sends an email to the admin/site owner whenever a booking has has their balance paid.
// Fetches the booking infromation with the reservation id and sends a summary of the booking.
// When the payment_method is IBAN it servers as a reminder for the owner to check their bank statements.
// When the payment_method is credit_card it shows the owner that a reservation has been fully paid for.
// 
// POST {reservation_id}:
// reservation_id: The reservation id which holds all the booking details.
// 
// translation isnt required here.
// POST email/paidBooking
*/
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Balance Paid in Full</title>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    /* ─── Outer Layout ─── */

    .outer {
      background-color: #f0ece4;
      width: 100%;
    }

    .wrapper {
      max-width: 620px;
      width: 100%;
      margin: 0 auto;
    }

    /* ─── Header ─── */

    .header {
      background: linear-gradient(160deg, #8b4513 0%, #b85c2a 100%);
      border-radius: 16px 16px 0 0;
      padding: 36px 48px 32px;
      text-align: center;
    }

    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-weight: 500;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 100px;
      margin-bottom: 18px;
    }

    .header-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: #fff;
      line-height: 1.3;
      text-shadow: 0 1px 6px rgba(80, 20, 0, 0.3);
    }

    .header-sub {
      margin-top: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      font-weight: 300;
    }

    /* ─── Body ─── */

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
      background: #fdf6f0;
      border-left: 3px solid #8b4513;
      border-radius: 0 8px 8px 0;
    }

    /* ─── Section Label ─── */

    .section-label {
      display: block;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #8b4513;
      margin-top: 28px;
      margin-bottom: 12px;
    }

    /* ─── Detail Table ─── */

    .detail-table {
      width: 100%;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .detail-table td {
      padding: 13px 20px;
    }

    .detail-table tr + tr td {
      border-top: 1px solid #f0ece4;
    }

    .td-label {
      font-size: 12px;
      color: #9c8e82;
      font-weight: 400;
    }

    .td-value {
      font-size: 13px;
      color: #2c2825;
      font-weight: 500;
      text-align: right;
    }

    /* ─── Payment Hero ─── */

    .payment-hero {
      width: 100%;
      background: linear-gradient(160deg, #8b4513 0%, #b85c2a 100%);
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 12px;
    }

    .payment-hero td {
      padding: 22px 24px;
      vertical-align: middle;
    }

    .payment-label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 5px;
    }

    .payment-amount {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      color: #fff;
      font-weight: 600;
      text-shadow: 0 1px 4px rgba(80, 20, 0, 0.2);
    }

    .payment-right {
      text-align: right;
    }

    .payment-method {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 6px;
    }

    .payment-status {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 12px;
      color: #fff;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .status-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #fff;
      margin-right: 5px;
      vertical-align: middle;
    }

    /* ─── Breakdown Table ─── */

    .breakdown-table {
      width: 100%;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .breakdown-table td {
      padding: 12px 20px;
      font-size: 13px;
    }

    .breakdown-table tr + tr td {
      border-top: 1px solid #f0ece4;
    }

    .breakdown-table tr:last-child {
      background: #faf8f5;
    }

    .b-label {
      color: #9c8e82;
    }

    .b-value {
      color: #2c2825;
      font-weight: 500;
      text-align: right;
    }

    /* ─── Two-Column Layout ─── */

    .two-col-outer {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .two-col-outer td {
      vertical-align: top;
    }

    .col-gap {
      width: 2%;
    }

    /* ─── Address Block ─── */

    .address-table {
      width: 100%;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .address-table td {
      padding: 16px 20px;
      font-size: 13px;
      line-height: 1.8;
      color: #2c2825;
    }

    .address-name {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .address-addr {
      color: #7a6e64;
    }

    /* ─── Divider ─── */

    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    /* ─── Final Note ─── */

    .final-note {
      font-size: 13px;
      line-height: 1.7;
      color: #7a6e64;
      text-align: center;
    }

    /* ─── Footer ─── */

    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 22px 48px;
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer-text + .footer-text {
      margin-top: 6px;
    }

    .footer-brand {
      color: #5c524a;
      font-weight: 500;
    }
  </style>

</head>

<body>

  <table class="outer" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table class="wrapper" cellpadding="0" cellspacing="0" border="0">

          <!-- ─── HEADER ─── -->
          <tr>
            <td class="header">
              <div class="header-badge">💳 Balance Paid in Full</div>
              <div class="header-title">Full Payment Received</div>
              <div class="header-sub">The guest's reservation is now fully settled.</div>
            </td>
          </tr>

          <!-- ─── BODY ─── -->
          <tr>
            <td class="body">

              <!-- Intro -->
              <div class="intro">
                The guest has paid the remaining balance for their reservation. No further action is required.
              </div>

              <!-- Reservation Details -->
              <span class="section-label">Reservation Details</span>

              <table class="detail-table" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="td-label">Reservation ID</td>
                  <td class="td-value">${reservation.id}</td>
                </tr>
                <tr>
                  <td class="td-label">Status</td>
                  <td class="td-value">${reservation.status}</td>
                </tr>
                <tr>
                  <td class="td-label">Created</td>
                  <td class="td-value">${reservation.created_at}</td>
                </tr>
                <tr>
                  <td class="td-label">Check-in</td>
                  <td class="td-value">${reservation.start_date}</td>
                </tr>
                <tr>
                  <td class="td-label">Check-out</td>
                  <td class="td-value">${reservation.end_date}</td>
                </tr>
              </table>

              <!-- Payment Summary -->
              <span class="section-label">Payment Summary</span>

              <table class="payment-hero" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div class="payment-label">Total Paid</div>
                    <div class="payment-amount">€ ${reservation.total_price}</div>
                  </td>
                  <td class="payment-right" align="right" valign="middle">
                    <div class="payment-method">${reservation.payment_method}</div>
                    <div class="payment-status">
                      <span class="status-dot"></span>
                      Paid in Full
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Updated Breakdown -->
              <span class="section-label">Updated Breakdown</span>

              <table class="breakdown-table" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="b-label">Accommodation Subtotal</td>
                  <td class="b-value">€ ${reservation.accommodation_subtotal}</td>
                </tr>
                <tr>
                  <td class="b-label">Sales Tax</td>
                  <td class="b-value">€ ${reservation.sales_tax}</td>
                </tr>
                <tr>
                  <td class="b-label">Tourist Tax</td>
                  <td class="b-value">€ ${reservation.tourist_tax}</td>
                </tr>
                <tr>
                  <td class="b-label">Credit Fees</td>
                  <td class="b-value">€ ${reservation.credit_fees}</td>
                </tr>
              </table>

              <!-- Guests & Contact -->
              <span class="section-label">Guests & Contact</span>

              <table class="two-col-outer" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="49%">
                    <table class="detail-table" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="td-label">Adults</td>
                        <td class="td-value">${reservation.guests_over}</td>
                      </tr>
                      <tr>
                        <td class="td-label">Children</td>
                        <td class="td-value">${reservation.guests_under}</td>
                      </tr>
                    </table>
                  </td>
                  <td class="col-gap"></td>
                  <td width="49%">
                    <table class="detail-table" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td class="td-label">Phone</td>
                        <td class="td-value">${reservation.phone}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Billing Information -->
              <span class="section-label">Billing Information</span>

              <table class="address-table" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div class="address-name">${reservation.billing_name}</div>
                    <div class="address-addr">
                      ${reservation.billing_address}<br />
                      ${reservation.billing_city}, ${reservation.billing_state}<br />
                      ${reservation.billing_postal_code}, ${reservation.billing_country}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr class="divider" />

              <!-- Final Note -->
              <p class="final-note">
                The guest has now fully paid for their stay. No further action is required.
              </p>

            </td>
          </tr>

          <!-- ─── FOOTER ─── -->
          <tr>
            <td class="footer">
              <p class="footer-text"><span class="footer-brand">Four Roses</span> · Internal Notification</p>
              <p class="footer-text">© ${currentYear} Four Roses · All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>

</html>
`;

    // Send the email
    const response = await resend.emails.send({
      from: `Four Roses Bookings <Booking@fourroses.fignet.ca>`,
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

/*
// Sends an email to the customer whenever a payment has been processed. This means:
// Once stripe has verified that the order has been paid for.
// Once the owner confirms that the money has been deposited in their account.
// This email is homogeneous in the sense where it will handle when the deposit is paid AND when the full amount has been paid.
//
// POST {reservation_id}:
// reservation_id: The reservation id which holds all the booking details.
// 
// POST email/confirmedBooking
*/
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

    // Get account information
    const { data: userInfo, error: reqError } = await supabase
      .from("users")
      .select("*")
      .eq("id", reservation.user_id)
      .single();
    if (reqError) throw reqError;

    // Get the users email
    const { data: userAuthInfo } = await supabase.auth.admin.getUserById(reservation.user_id);
    const customerEmail = userAuthInfo.user.email;

    const emailTranslations = {
      en: {
        subject: `Your Payment Has Been Confirmed - Reservation ${reservation.id}`,
        Payment_received: "Payment received",
        title: "Your Stay is",
        Confirmed: "Confirmed",
        Reserved: "Reserved",
        title_sub: "We can't wait to welcome you",
        Hello: "Hello",
        Your: "Your",
        iban: "IBAN bank transfer",
        credit: "credit card payment",
        fully:
          "has been validated and your payment has been fully processed. <br/>Everything is in order. Your booking is now complete",
        deposit:
          "has been validated and your deposit has been processed. <br />The remaining balance is due prior to your reservation date. Please ensure the outstanding amount is settled <b>before</b> arrival",
        reservation: "Reservation Details",
        res_id: "Reservation ID",
        checkin: "Check-in",
        chechout: "Check-out",
        remaining: "Remaining balance",
        payConfirm: "Payment Confirmation",
        total: "Total Paid",
        fullyPaid: "Fully Paid",
        depositPaid: "Deposit Paid",
        infoBox:
          "Prior to check-in, you'll receive arrival instructions and all the property details you need for a smooth, comfortable stay",
        footNote1:
          "If you have any questions in the meantime, simply reply to this email! We're happy to help",
        footNote2: "Thank you for choosing to stay with us. We look forward to welcoming you soon",
        help: "Need help",
        reply: "Reply to this email and we'll get back to you promptly",
        rights: "All rights reserved",
      },

      fr: {
        subject: `Votre paiement a été confirmé - Réservation ${reservation.id}`,
        Payment_received: "Paiement reçu",
        title: "Votre séjour est",
        Confirmed: "Confirmé",
        Reserved: "Réservé",
        title_sub: "Nous avons hâte de vous accueillir",
        Hello: "Bonjour",
        Your: "Votre",
        iban: "virement bancaire IBAN",
        credit: "paiement par carte bancaire",
        fully:
          "a été validé et votre paiement a été entièrement traité. <br/>Tout est en ordre. Votre réservation est maintenant complète",
        deposit:
          "a été validé et votre acompte a été traité. <br />Le solde restant est dû avant la date de votre réservation. Veuillez vous assurer que le montant est réglé <b>avant</b> l'arrivée",
        reservation: "Détails de la réservation",
        res_id: "ID de réservation",
        checkin: "Arrivée",
        chechout: "Départ",
        remaining: "Solde restant",
        payConfirm: "Confirmation de paiement",
        total: "Total payé",
        fullyPaid: "Entièrement payé",
        depositPaid: "Acompte payé",
        infoBox:
          "Avant l'arrivée, vous recevrez les instructions d'accès et tous les détails nécessaires pour un séjour agréable",
        footNote1:
          "Si vous avez des questions, répondez simplement à cet e-mail ! Nous serons heureux de vous aider",
        footNote2:
          "Merci d'avoir choisi de séjourner chez nous. Nous avons hâte de vous accueillir bientôt",
        help: "Besoin d'aide",
        reply: "Répondez à cet e-mail et nous vous répondrons rapidement",
        rights: "Tous droits réservés",
      },

      es: {
        subject: `Su pago ha sido confirmado - Reserva ${reservation.id}`,
        Payment_received: "Pago recibido",
        title: "Su estancia está",
        Confirmed: "Confirmada",
        Reserved: "Reservada",
        title_sub: "Estamos deseando darle la bienvenida",
        Hello: "Hola",
        Your: "Su",
        iban: "transferencia bancaria IBAN",
        credit: "pago con tarjeta de crédito",
        fully:
          "ha sido validado y su pago ha sido procesado completamente. <br/>Todo está en orden. Su reserva está ahora completa",
        deposit:
          "ha sido validado y su depósito ha sido procesado. <br />El saldo restante debe pagarse antes de la fecha de su reserva. Por favor, asegúrese de liquidar el importe pendiente <b>antes</b> de la llegada",
        reservation: "Detalles de la reserva",
        res_id: "ID de reserva",
        checkin: "Entrada",
        chechout: "Salida",
        remaining: "Saldo restante",
        payConfirm: "Confirmación de pago",
        total: "Total pagado",
        fullyPaid: "Pagado completamente",
        depositPaid: "Depósito pagado",
        infoBox:
          "Antes del check-in, recibirá instrucciones de llegada y todos los detalles de la propiedad para una estancia cómoda",
        footNote1:
          "Si tiene alguna pregunta, ¡simplemente responda a este correo! Estaremos encantados de ayudarle",
        footNote2: "Gracias por elegirnos. Esperamos darle la bienvenida pronto",
        help: "¿Necesita ayuda?",
        reply: "Responda a este correo y le contestaremos a la brevedad",
        rights: "Todos los derechos reservados",
      },

      de: {
        subject: `Ihre Zahlung wurde bestätigt - Reservierung ${reservation.id}`,
        Payment_received: "Zahlung eingegangen",
        title: "Ihr Aufenthalt ist",
        Confirmed: "Bestätigt",
        Reserved: "Reserviert",
        title_sub: "Wir freuen uns darauf, Sie zu empfangen",
        Hello: "Hallo",
        Your: "Ihre",
        iban: "IBAN-Banküberweisung",
        credit: "Kreditkartenzahlung",
        fully:
          "wurde validiert und Ihre Zahlung wurde vollständig verarbeitet. <br/>Alles ist in Ordnung. Ihre Buchung ist jetzt abgeschlossen",
        deposit:
          "wurde validiert und Ihre Anzahlung wurde verarbeitet. <br />Der verbleibende Betrag ist vor Ihrem Reservierungsdatum fällig. Bitte stellen Sie sicher, dass der ausstehende Betrag <b>vor</b> der Anreise beglichen wird",
        reservation: "Reservierungsdetails",
        res_id: "Reservierungs-ID",
        checkin: "Anreise",
        chechout: "Abreise",
        remaining: "Restbetrag",
        payConfirm: "Zahlungsbestätigung",
        total: "Gesamt bezahlt",
        fullyPaid: "Vollständig bezahlt",
        depositPaid: "Anzahlung bezahlt",
        infoBox:
          "Vor dem Check-in erhalten Sie Anreiseanweisungen und alle Informationen zur Unterkunft für einen angenehmen Aufenthalt",
        footNote1: "Bei Fragen antworten Sie einfach auf diese E-Mail! Wir helfen Ihnen gerne",
        footNote2:
          "Vielen Dank, dass Sie sich für uns entschieden haben. Wir freuen uns darauf, Sie bald willkommen zu heißen",
        help: "Hilfe benötigt",
        reply: "Antworten Sie auf diese E-Mail und wir melden uns umgehend",
        rights: "Alle Rechte vorbehalten",
      },

      pt: {
        subject: `O seu pagamento foi confirmado - Reserva ${reservation.id}`,
        Payment_received: "Pagamento recebido",
        title: "A sua estadia está",
        Confirmed: "Confirmada",
        Reserved: "Reservada",
        title_sub: "Mal podemos esperar para recebê-lo",
        Hello: "Olá",
        Your: "O seu",
        iban: "transferência bancária IBAN",
        credit: "pagamento com cartão de crédito",
        fully:
          "foi validado e o seu pagamento foi totalmente processado. <br/>Tudo está em ordem. A sua reserva está agora completa",
        deposit:
          "foi validado e o seu depósito foi processado. <br />O saldo restante deve ser pago antes da data da sua reserva. Por favor, certifique-se de que o valor pendente é liquidado <b>antes</b> da chegada",
        reservation: "Detalhes da Reserva",
        res_id: "ID da reserva",
        checkin: "Check-in",
        chechout: "Check-out",
        remaining: "Saldo restante",
        payConfirm: "Confirmação de Pagamento",
        total: "Total pago",
        fullyPaid: "Totalmente pago",
        depositPaid: "Depósito pago",
        infoBox:
          "Antes do check-in, receberá instruções de chegada e todos os detalhes da propriedade para uma estadia confortável",
        footNote1:
          "Se tiver alguma dúvida, basta responder a este e-mail! Teremos todo o gosto em ajudar",
        footNote2: "Obrigado por nos escolher. Esperamos recebê-lo em breve",
        help: "Precisa de ajuda?",
        reply: "Responda a este e-mail e entraremos em contacto rapidamente",
        rights: "Todos os direitos reservados",
      },

      nl: {
        subject: `Uw betaling is bevestigd - Reservering ${reservation.id}`,
        Payment_received: "Betaling ontvangen",
        title: "Uw verblijf is",
        Confirmed: "Bevestigd",
        Reserved: "Gereserveerd",
        title_sub: "We kijken ernaar uit u te verwelkomen",
        Hello: "Hallo",
        Your: "Uw",
        iban: "IBAN-bankoverschrijving",
        credit: "creditcardbetaling",
        fully:
          "is gevalideerd en uw betaling is volledig verwerkt. <br/>Alles is in orde. Uw boeking is nu voltooid",
        deposit:
          "is gevalideerd en uw aanbetaling is verwerkt. <br />Het resterende saldo dient vóór uw reserveringsdatum te worden betaald. Zorg ervoor dat het openstaande bedrag <b>voor</b> aankomst is voldaan",
        reservation: "Reserveringsgegevens",
        res_id: "Reserverings-ID",
        checkin: "Inchecken",
        chechout: "Uitchecken",
        remaining: "Resterend saldo",
        payConfirm: "Betalingsbevestiging",
        total: "Totaal betaald",
        fullyPaid: "Volledig betaald",
        depositPaid: "Aanbetaling gedaan",
        infoBox:
          "Voor het inchecken ontvangt u aankomstinstructies en alle informatie over de accommodatie voor een prettig verblijf",
        footNote1: "Heeft u vragen, beantwoord dan gewoon deze e-mail! We helpen u graag",
        footNote2: "Bedankt voor uw keuze. We kijken ernaar uit u binnenkort te verwelkomen",
        help: "Hulp nodig?",
        reply: "Beantwoord deze e-mail en we reageren zo snel mogelijk",
        rights: "Alle rechten voorbehouden",
      },
    };

    const tr = emailTranslations[userInfo.preferred_language] || emailTranslations.en;

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    /* ─── Outer Layout ─── */

    .outer {
      background-color: #f0ece4;
      width: 100%;
    }

    .wrapper {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
    }

    /* ─── Header ─── */

    .header {
      background: linear-gradient(160deg, #8b4513 0%, #b85c2a 100%);
      border-radius: 16px 16px 0 0;
      padding: 40px 48px 36px;
      text-align: center;
    }

    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
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

    .header-title {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      font-weight: 600;
      color: #fff;
      line-height: 1.3;
      text-shadow: 0 1px 6px rgba(80, 20, 0, 0.3);
    }

    .header-sub {
      margin-top: 10px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 300;
    }

    /* ─── Body ─── */

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

    /* ─── Section Label ─── */

    .section-label {
      display: block;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #8b4513;
      margin-top: 28px;
      margin-bottom: 12px;
    }

    /* ─── Detail Table ─── */

    .detail-table {
      width: 100%;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .detail-table td {
      padding: 14px 20px;
    }

    .detail-table tr + tr td {
      border-top: 1px solid #f0ece4;
    }

    .td-label {
      font-size: 12px;
      color: #9c8e82;
      font-weight: 400;
      letter-spacing: 0.3px;
    }

    .td-value {
      font-size: 14px;
      color: #2c2825;
      font-weight: 500;
      text-align: right;
    }

    /* ─── Payment Hero ─── */

    .payment-hero {
      width: 100%;
      background: linear-gradient(160deg, #8b4513 0%, #b85c2a 100%);
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 12px;
    }

    .payment-hero td {
      padding: 24px;
      vertical-align: middle;
    }

    .payment-label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 6px;
    }

    .payment-amount {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #fff;
      font-weight: 600;
      text-shadow: 0 1px 4px rgba(80, 20, 0, 0.2);
    }

    .payment-status {
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 10px 16px;
      text-align: center;
    }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #fff;
      margin-right: 6px;
      vertical-align: middle;
    }

    .status-text {
      font-size: 12px;
      color: #fff;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    /* ─── Info Box ─── */

    .info-box {
      background: #fdf6f0;
      border-left: 3px solid #8b4513;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin-top: 28px;
      font-size: 14px;
      line-height: 1.7;
      color: #5c524a;
    }

    /* ─── Divider ─── */

    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    /* ─── Footer Notes ─── */

    .footer-note {
      font-size: 13px;
      line-height: 1.7;
      color: #7a6e64;
      margin-bottom: 8px;
    }

    /* ─── Footer ─── */

    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 24px 48px;
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer-text + .footer-text {
      margin-top: 8px;
    }

    .footer-brand {
      color: #5c524a;
      font-weight: 500;
    }
  </style>

</head>

<body>

  <table class="outer" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table class="wrapper" cellpadding="0" cellspacing="0" border="0">

          <!-- ─── HEADER ─── -->
          <tr>
            <td class="header">
              <div class="header-badge">✓ ${tr.Payment_received}</div>
              <div class="header-title">${tr.title} ${
      parseFloat(reservation.amount_paid) >= parseFloat(reservation.total_price)
        ? `${tr.Confirmed}`
        : `${tr.Reserved}`
    }</div>
              <div class="header-sub">${tr.title_sub}.</div>
            </td>
          </tr>

          <!-- ─── BODY ─── -->
          <tr>
            <td class="body">

              <!-- Greeting -->
              <p class="greeting">${tr.Hello} <strong>${reservation.billing_name}</strong>,</p>
              <p class="intro">
              ${
                parseFloat(reservation.amount_paid) >= parseFloat(reservation.total_price)
                  ? `${tr.Your} ${
                      reservation.payment_method == "iban" ? `${tr.iban}` : `${tr.credit}`
                    } 
                  ${tr.fully}.`
                  : `${tr.Your} ${
                      reservation.payment_method == "iban" ? `${tr.iban}` : `${tr.credit}`
                    }  ${tr.deposit}.`
              }
              </p>

              <!-- Reservation Details -->
              <span class="section-label">${tr.reservation}</span>

              <table class="detail-table" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="td-label">${tr.res_id}</td>
                  <td class="td-value">${reservation.id}</td>
                </tr>
                <tr>
                  <td class="td-label">${tr.checkin}</td>
                  <td class="td-value">${reservation.start_date}</td>
                </tr>
                <tr>
                  <td class="td-label">${tr.chechout}</td>
                  <td class="td-value">${reservation.end_date}</td>
                </tr>
                ${
                  parseFloat(reservation.amount_paid) < parseFloat(reservation.total_price)
                    ? `<tr>
                  <td class="td-label">${tr.remaining}</td>
                  <td class="td-value">€ ${(
                    parseFloat(reservation.total_price) - parseFloat(reservation.amount_paid)
                  ).toFixed(2)}</td>
                </tr>`
                    : ""
                }
              </table>

              <!-- Payment Confirmation -->
              <span class="section-label">${tr.payConfirm}</span>

              <table class="payment-hero" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div class="payment-label">${tr.total}</div>
                    <div class="payment-amount">€ ${reservation.amount_paid}</div>
                  </td>
                  <td align="right" valign="middle">
                    <div class="payment-status">
                      <span class="status-dot"></span>
                      <span class="status-text">${
                        parseFloat(reservation.amount_paid) >= parseFloat(reservation.total_price)
                          ? `${tr.fullyPaid}`
                          : `${tr.depositPaid}`
                      } </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Info Box -->
              <div class="info-box">
                ${tr.infoBox}.
              </div>

              <!-- Divider -->
              <hr class="divider" />

              <!-- Footer Notes -->
              <p class="footer-note">
                ${tr.footNote1}.
              </p>
              <p class="footer-note">
                ${tr.footNote2}.
              </p>

            </td>
          </tr>

          <!-- ─── FOOTER ─── -->
          <tr>
            <td class="footer">
              <p class="footer-text"><span class="footer-brand">${tr.help}?</span> ${tr.reply}.</p>
              <p class="footer-text">© ${currentYear} · ${tr.rights}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>

</html>
`;

    // Send the email
    const response = await resend.emails.send({
      from: `Four Roses Bookings <Booking@fourroses.fignet.ca>`,
      to: `${customerEmail}`,
      reply_to: "booking@fourroses.fignet.ca",
      subject: `${tr.subject}`,
      html,
    });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send booking email" });
  }
};

/*
// Sends an email to the customer whenever the secuirty deposit amount has been refunded.
//
// POST {reservation_id}:
// reservation_id: The reservation id which holds all the booking details.
// 
// POST email/securityDepositSettled
*/
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

    // Get account information
    const { data: userInfo, error: reqError } = await supabase
      .from("users")
      .select("*")
      .eq("id", reservation.user_id)
      .single();
    if (reqError) throw reqError;

    // Get the user's email
    const { data: userAuthInfo } = await supabase.auth.admin.getUserById(reservation.user_id);
    const customerEmail = userAuthInfo.user.email;

    const emailTranslations = {
      en: {
        subject: `Your Security Deposit Has Been Settled - Reservation ${reservation.id}`,
        deposit: "Deposit Settled",
        returned: "Your Deposit Has Been Returned",
        wrapped: "Everything is wrapped up! thank you for your stay",
        hello: "Hello",
        processed:
          "Your security deposit has been successfully processed and the transaction is now complete. <br />We hope you had a wonderful stay and that everything met your expectations",
        details: "Reservation Details",
        id: "Reservation ID",
        checkin: "Check-in",
        chechout: "Check-out",
        depositInfo: "Deposit Information",
        refund: "Amount Refunded",
        refunded: "Refunded",
        infoBox:
          'You can download a PDF copy of your invoice anytime from your account dashboard under the <strong>"Booking"</strong> section',
        footNote:
          "If you have any questions or need assistance, simply reply to this email! we're always happy to help",
        signOff: `"Thank you for staying at Four Roses. We hope to have the pleasure of welcoming you back in the future."`,
        help: "Need help",
        reply: "Reply to this email and we'll get back to you promptly",
        rights: "All rights reserved",
      },

      fr: {
        subject: `Votre dépôt de garantie a été réglé - Réservation ${reservation.id}`,
        deposit: "Dépôt réglé",
        returned: "Votre dépôt a été remboursé",
        wrapped: "Tout est bouclé ! Merci pour votre séjour",
        hello: "Bonjour",
        processed:
          "Votre dépôt de garantie a été traité avec succès et la transaction est maintenant terminée. <br />Nous espérons que vous avez passé un merveilleux séjour et que tout a répondu à vos attentes",
        details: "Détails de la réservation",
        id: "ID de réservation",
        checkin: "Arrivée",
        chechout: "Départ",
        depositInfo: "Informations sur le dépôt",
        refund: "Montant remboursé",
        refunded: "Remboursé",
        infoBox:
          "Vous pouvez télécharger une copie PDF de votre facture à tout moment depuis votre tableau de bord sous la section <strong>« Réservation »</strong>",
        footNote:
          "Si vous avez des questions ou besoin d'aide, répondez simplement à cet e-mail ! Nous sommes toujours heureux de vous aider",
        signOff: `"Merci d'avoir séjourné chez Four Roses. Nous espérons avoir le plaisir de vous accueillir à nouveau à l'avenir."`,
        help: "Besoin d'aide",
        reply: "Répondez à cet e-mail et nous vous répondrons rapidement",
        rights: "Tous droits réservés",
      },

      es: {
        subject: `Su depósito de seguridad ha sido liquidado - Reserva ${reservation.id}`,
        deposit: "Depósito liquidado",
        returned: "Su depósito ha sido devuelto",
        wrapped: "¡Todo está resuelto! Gracias por su estancia",
        hello: "Hola",
        processed:
          "Su depósito de seguridad ha sido procesado con éxito y la transacción está ahora completa. <br />Esperamos que haya disfrutado de una estancia maravillosa y que todo haya cumplido sus expectativas",
        details: "Detalles de la reserva",
        id: "ID de reserva",
        checkin: "Entrada",
        chechout: "Salida",
        depositInfo: "Información del depósito",
        refund: "Importe reembolsado",
        refunded: "Reembolsado",
        infoBox:
          "Puede descargar una copia en PDF de su factura en cualquier momento desde su panel de cuenta, en la sección <strong>«Reserva»</strong>",
        footNote:
          "Si tiene alguna pregunta o necesita ayuda, ¡simplemente responda a este correo! siempre estamos encantados de ayudar",
        signOff: `"Gracias por alojarse en Four Roses. Esperamos tener el placer de recibirle de nuevo en el futuro."`,
        help: "¿Necesita ayuda?",
        reply: "Responda a este correo y le contestaremos a la brevedad",
        rights: "Todos los derechos reservados",
      },

      de: {
        subject: `Ihre Sicherheitsleistung wurde abgerechnet - Reservierung ${reservation.id}`,
        deposit: "Kaution abgerechnet",
        returned: "Ihre Kaution wurde zurückerstattet",
        wrapped: "Alles ist erledigt! Vielen Dank für Ihren Aufenthalt",
        hello: "Hallo",
        processed:
          "Ihre Sicherheitsleistung wurde erfolgreich verarbeitet und die Transaktion ist nun abgeschlossen. <br />Wir hoffen, dass Sie einen wunderschönen Aufenthalt hatten und alles Ihren Erwartungen entsprochen hat",
        details: "Reservierungsdetails",
        id: "Reservierungs-ID",
        checkin: "Anreise",
        chechout: "Abreise",
        depositInfo: "Kautionsinformationen",
        refund: "Erstatteter Betrag",
        refunded: "Erstattet",
        infoBox:
          'Sie können jederzeit eine PDF-Kopie Ihrer Rechnung aus Ihrem Konto-Dashboard im Bereich <strong>„Buchung"</strong> herunterladen',
        footNote:
          "Bei Fragen oder wenn Sie Hilfe benötigen, antworten Sie einfach auf diese E-Mail! Wir helfen Ihnen immer gerne",
        signOff: `"Vielen Dank für Ihren Aufenthalt bei Four Roses. Wir hoffen, Sie in Zukunft wieder begrüßen zu dürfen."`,
        help: "Hilfe benötigt",
        reply: "Antworten Sie auf diese E-Mail und wir melden uns umgehend",
        rights: "Alle Rechte vorbehalten",
      },

      pt: {
        subject: `O seu depósito de segurança foi liquidado - Reserva ${reservation.id}`,
        deposit: "Depósito liquidado",
        returned: "O seu depósito foi devolvido",
        wrapped: "Está tudo resolvido! Obrigado pela sua estadia",
        hello: "Olá",
        processed:
          "O seu depósito de segurança foi processado com sucesso e a transação está agora completa. <br />Esperamos que tenha tido uma estadia maravilhosa e que tudo tenha correspondido às suas expectativas",
        details: "Detalhes da Reserva",
        id: "ID da reserva",
        checkin: "Check-in",
        chechout: "Check-out",
        depositInfo: "Informações sobre o depósito",
        refund: "Valor reembolsado",
        refunded: "Reembolsado",
        infoBox:
          "Pode descarregar uma cópia em PDF da sua fatura a qualquer momento no seu painel de conta, na secção <strong>«Reserva»</strong>",
        footNote:
          "Se tiver alguma dúvida ou precisar de ajuda, basta responder a este e-mail! Estamos sempre disponíveis para ajudar",
        signOff: `"Obrigado por ficar na Four Roses. Esperamos ter o prazer de o receber novamente no futuro."`,
        help: "Precisa de ajuda?",
        reply: "Responda a este e-mail e entraremos em contacto rapidamente",
        rights: "Todos os direitos reservados",
      },

      nl: {
        subject: `Uw borg is verrekend - Reservering ${reservation.id}`,
        deposit: "Borg verrekend",
        returned: "Uw borg is terugbetaald",
        wrapped: "Alles is afgerond! Bedankt voor uw verblijf",
        hello: "Hallo",
        processed:
          "Uw borg is succesvol verwerkt en de transactie is nu voltooid. <br />We hopen dat u een geweldig verblijf heeft gehad en dat alles aan uw verwachtingen heeft voldaan",
        details: "Reserveringsgegevens",
        id: "Reserverings-ID",
        checkin: "Inchecken",
        chechout: "Uitchecken",
        depositInfo: "Borginformatie",
        refund: "Terugbetaald bedrag",
        refunded: "Terugbetaald",
        infoBox:
          "U kunt altijd een PDF-kopie van uw factuur downloaden vanuit uw accountdashboard onder het gedeelte <strong>«Boeking»</strong>",
        footNote:
          "Als u vragen heeft of hulp nodig heeft, beantwoord dan gewoon deze e-mail! we helpen altijd graag",
        signOff: `"Bedankt voor uw verblijf bij Four Roses. We hopen u in de toekomst weer te mogen verwelkomen."`,
        help: "Hulp nodig?",
        reply: "Beantwoord deze e-mail en we reageren zo snel mogelijk",
        rights: "Alle rechten voorbehouden",
      },
    };

    const tr = emailTranslations[userInfo.preferred_language] || emailTranslations.en;

    // Build HTML email
    const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Security Deposit Settled</title>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #f0ece4;
      font-family: 'DM Sans', sans-serif;
      color: #2c2825;
      padding: 40px 16px;
    }

    /* ─── Outer Layout ─── */

    .outer {
      background-color: #f0ece4;
      width: 100%;
    }

    .wrapper {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
    }

    /* ─── Header ─── */

    .header {
      background: linear-gradient(160deg, #8b4513 0%, #b85c2a 100%);
      border-radius: 16px 16px 0 0;
      padding: 40px 48px 36px;
      text-align: center;
    }

    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
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

    .header-title {
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      font-weight: 600;
      color: #fff;
      line-height: 1.3;
      text-shadow: 0 1px 6px rgba(80, 20, 0, 0.3);
    }

    .header-sub {
      margin-top: 10px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 300;
    }

    /* ─── Body ─── */

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

    /* ─── Section Label ─── */

    .section-label {
      display: block;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #8b4513;
      margin-top: 28px;
      margin-bottom: 12px;
    }

    /* ─── Detail Table ─── */

    .detail-table {
      width: 100%;
      border: 1px solid #e8e0d4;
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .detail-table td {
      padding: 14px 20px;
    }

    .detail-table tr + tr td {
      border-top: 1px solid #f0ece4;
    }

    .td-label {
      font-size: 12px;
      color: #9c8e82;
      font-weight: 400;
      letter-spacing: 0.3px;
    }

    .td-value {
      font-size: 14px;
      color: #2c2825;
      font-weight: 500;
      text-align: right;
    }

    /* ─── Deposit Hero ─── */

    .deposit-hero {
      width: 100%;
      background: linear-gradient(160deg, #8b4513 0%, #b85c2a 100%);
      border-radius: 12px;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 12px;
    }

    .deposit-hero td {
      padding: 24px;
      vertical-align: middle;
    }

    .deposit-label {
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 6px;
    }

    .deposit-amount {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #fff;
      font-weight: 600;
      text-shadow: 0 1px 4px rgba(80, 20, 0, 0.2);
    }

    .deposit-status {
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 10px 16px;
      text-align: center;
    }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #fff;
      margin-right: 6px;
      vertical-align: middle;
    }

    .status-text {
      font-size: 12px;
      color: #fff;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    /* ─── Info Box ─── */

    .info-box {
      background: #fdf6f0;
      border-left: 3px solid #8b4513;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin-top: 28px;
      font-size: 14px;
      line-height: 1.7;
      color: #5c524a;
    }

    /* ─── Divider ─── */

    .divider {
      border: none;
      border-top: 1px solid #e8e0d4;
      margin: 28px 0;
    }

    /* ─── Footer Note ─── */

    .footer-note {
      font-size: 13px;
      line-height: 1.7;
      color: #7a6e64;
      margin-bottom: 8px;
    }

    /* ─── Sign-off ─── */

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

    /* ─── Footer ─── */

    .footer {
      background: #f5f0e8;
      border-radius: 0 0 16px 16px;
      padding: 24px 48px;
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #9c8e82;
      line-height: 1.7;
    }

    .footer-text + .footer-text {
      margin-top: 8px;
    }

    .footer-brand {
      color: #5c524a;
      font-weight: 500;
    }
  </style>

</head>

<body>

  <table class="outer" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table class="wrapper" cellpadding="0" cellspacing="0" border="0">

          <!-- ─── HEADER ─── -->
          <tr>
            <td class="header">
              <div class="header-badge">🔒 ${tr.deposit}</div>
              <div class="header-title">${tr.returned}</div>
              <div class="header-sub">${tr.wrapped}.</div>
            </td>
          </tr>

          <!-- ─── BODY ─── -->
          <tr>
            <td class="body">

              <!-- Greeting -->
              <p class="greeting">${tr.hello} <strong>${reservation.billing_name}</strong>,</p>
              <p class="intro">
                ${tr.processed}.
              </p>

              <!-- Reservation Details -->
              <span class="section-label">${tr.details}</span>

              <table class="detail-table" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="td-label">${tr.id}</td>
                  <td class="td-value">${reservation.id}</td>
                </tr>
                <tr>
                  <td class="td-label">${tr.checkin}</td>
                  <td class="td-value">${reservation.start_date}</td>
                </tr>
                <tr>
                  <td class="td-label">${tr.chechout}</td>
                  <td class="td-value">${reservation.end_date}</td>
                </tr>
              </table>

              <!-- Deposit Information -->
              <span class="section-label">${tr.depositInfo}</span>

              <table class="deposit-hero" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div class="deposit-label">${tr.refund}</div>
                    <div class="deposit-amount">€ ${reservation.security_deposit_refunded_amount}</div>
                  </td>
                  <td align="right" valign="middle">
                    <div class="deposit-status">
                      <span class="status-dot"></span>
                      <span class="status-text">${tr.refunded}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Info Box -->
              <div class="info-box">
                ${tr.infoBox}.
              </div>

              <!-- Footer Note -->
              <p class="footer-note">
                ${tr.footNote}.
              </p>

              <!-- Sign-off -->
              <div class="signoff">
                ${tr.signOff}
              </div>

            </td>
          </tr>

          <!-- ─── FOOTER ─── -->
          <tr>
            <td class="footer">
              <p class="footer-text"><span class="footer-brand">${tr.help}?</span> ${tr.reply}.</p>
              <p class="footer-text">© ${currentYear} Four Roses · ${tr.rights}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>

</html>
    `;

    // Send the email
    const response = await resend.emails.send({
      from: `Four Roses Bookings <Booking@fourroses.fignet.ca>`,
      reply_to: "booking@fourroses.fignet.ca",
      to: `${customerEmail}`,
      subject: tr.subject,
      html,
    });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send security deposit email" });
  }
};

/*
// Sends an email to the customer Email adrress with a password recorvery link
//
// POST {reservation_id}:
// reservation_id: The reservation id which holds all the booking details.
// 
// POST email/passwordReset
*/
export const sendPasswordReset = async (req, res, next) => {
  const { email, lang } = req.body;

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      },
    });

    if (error) return res.status(400).json({ error: error.message });

    const resetLink = data.properties.action_link;

    const emailTranslations = {
      en: {
        subject: "Reset Your Password – Four Roses",
        title: "Reset Your Password",
        subtitle: "Secure account recovery",
        greeting: "Hello,",
        message:
          "We received a request to reset the password for your Four Roses account. Click the button below to choose a new password. If you didn't make this request, you can safely ignore this email — your password will not be changed.",
        cta: "Reset My Password",
        expiry:
          "This link will expire in <strong>1 hour</strong>. After that, you'll need to request a new reset link from the sign-in page.",
        fallbackTitle:
          "If the button above doesn't work, copy and paste this link into your browser:",
        footerNote: `This email was sent to <strong>${email}</strong> because a password reset was requested.<br />If you did not request this, no action is required.`,
        contact: "Contact Us",
        rights: "© 2026 Four Roses. All rights reserved.",
      },
      fr: {
        subject: "Réinitialisez votre mot de passe – Four Roses",
        title: "Réinitialisation du mot de passe",
        subtitle: "Récupération sécurisée du compte",
        greeting: "Bonjour,",
        message:
          "Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte Four Roses. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail — votre mot de passe ne sera pas modifié.",
        cta: "Réinitialiser mon mot de passe",
        expiry:
          "Ce lien expirera dans <strong>1 heure</strong>. Après cela, vous devrez demander un nouveau lien depuis la page de connexion.",
        fallbackTitle:
          "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :",
        footerNote: `Cet e-mail a été envoyé à <strong>${email}</strong> suite à une demande de réinitialisation de mot de passe.<br />Si vous n'avez pas fait cette demande, aucune action n'est requise.`,
        contact: "Nous contacter",
        rights: "© 2026 Four Roses. Tous droits réservés.",
      },
      es: {
        subject: "Restablezca su contraseña – Four Roses",
        title: "Restablecer contraseña",
        subtitle: "Recuperación segura de cuenta",
        greeting: "Hola,",
        message:
          "Hemos recibido una solicitud para restablecer la contraseña de su cuenta Four Roses. Haga clic en el botón a continuación para elegir una nueva contraseña. Si no realizó esta solicitud, puede ignorar este correo — su contraseña no será modificada.",
        cta: "Restablecer mi contraseña",
        expiry:
          "Este enlace expirará en <strong>1 hora</strong>. Después deberá solicitar un nuevo enlace desde la página de inicio de sesión.",
        fallbackTitle: "Si el botón no funciona, copie y pegue este enlace en su navegador:",
        footerNote: `Este correo fue enviado a <strong>${email}</strong> porque se solicitó un restablecimiento de contraseña.<br />Si no lo solicitó, no es necesaria ninguna acción.`,
        contact: "Contáctenos",
        rights: "© 2026 Four Roses. Todos los derechos reservados.",
      },
      de: {
        subject: "Passwort zurücksetzen – Four Roses",
        title: "Passwort zurücksetzen",
        subtitle: "Sichere Kontowiederherstellung",
        greeting: "Hallo,",
        message:
          "Wir haben eine Anfrage erhalten, das Passwort für Ihr Four Roses-Konto zurückzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort zu wählen. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren — Ihr Passwort wird nicht geändert.",
        cta: "Passwort zurücksetzen",
        expiry:
          "Dieser Link läuft in <strong>1 Stunde</strong> ab. Danach müssen Sie einen neuen Link von der Anmeldeseite anfordern.",
        fallbackTitle:
          "Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:",
        footerNote: `Diese E-Mail wurde an <strong>${email}</strong> gesendet, da eine Passwortzurücksetzung angefordert wurde.<br />Falls Sie dies nicht angefordert haben, ist keine Aktion erforderlich.`,
        contact: "Kontakt",
        rights: "© 2026 Four Roses. Alle Rechte vorbehalten.",
      },
      pt: {
        subject: "Redefina a sua palavra-passe – Four Roses",
        title: "Redefinição de palavra-passe",
        subtitle: "Recuperação segura de conta",
        greeting: "Olá,",
        message:
          "Recebemos um pedido para redefinir a palavra-passe da sua conta Four Roses. Clique no botão abaixo para escolher uma nova palavra-passe. Se não fez este pedido, pode ignorar este e-mail — a sua palavra-passe não será alterada.",
        cta: "Redefinir a minha palavra-passe",
        expiry:
          "Este link expirará em <strong>1 hora</strong>. Após isso, precisará de solicitar um novo link a partir da página de início de sessão.",
        fallbackTitle: "Se o botão não funcionar, copie e cole este link no seu navegador:",
        footerNote: `Este e-mail foi enviado para <strong>${email}</strong> porque foi solicitada uma redefinição de palavra-passe.<br />Se não foi você, nenhuma ação é necessária.`,
        contact: "Contacte-nos",
        rights: "© 2026 Four Roses. Todos os direitos reservados.",
      },
      nl: {
        subject: "Wachtwoord opnieuw instellen – Four Roses",
        title: "Wachtwoord opnieuw instellen",
        subtitle: "Veilig accountherstel",
        greeting: "Hallo,",
        message:
          "We hebben een verzoek ontvangen om het wachtwoord van uw Four Roses-account opnieuw in te stellen. Klik op de knop hieronder om een nieuw wachtwoord te kiezen. Als u dit verzoek niet heeft gedaan, kunt u deze e-mail veilig negeren — uw wachtwoord wordt niet gewijzigd.",
        cta: "Wachtwoord opnieuw instellen",
        expiry:
          "Deze link verloopt over <strong>1 uur</strong>. Daarna moet u een nieuwe link aanvragen via de inlogpagina.",
        fallbackTitle: "Als de knop niet werkt, kopieer en plak dan deze link in uw browser:",
        footerNote: `Deze e-mail is verzonden naar <strong>${email}</strong> omdat een wachtwoordreset werd aangevraagd.<br />Als u dit niet heeft gedaan, is er geen actie vereist.`,
        contact: "Neem contact op",
        rights: "© 2026 Four Roses. Alle rechten voorbehouden.",
      },
    };

    const tr = emailTranslations[lang] || emailTranslations.en;

    const html = `<!DOCTYPE html>
<html lang="${lang || "en"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${tr.title} – 4Roses</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #f5ede4;
      font-family: Arial, sans-serif;
      color: #2c2420;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { max-width: 560px; margin: 48px auto; padding: 0 16px 48px; }
    .header { text-align: center; padding: 32px 0 24px; }
    .card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #ede5db;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(139, 69, 19, 0.08);
    }
    .card-banner {
      background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
      padding: 36px 40px 32px;
      text-align: center;
    }
    .card-banner h1 {
      font-family: Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      color: #ffffff;
      letter-spacing: 0.02em;
    }
    .card-banner p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
      margin-top: 6px;
      letter-spacing: 0.03em;
    }
    .card-body { padding: 36px 40px; }
    .greeting { font-size: 15px; color: #2c2420; line-height: 1.6; margin-bottom: 12px; }
    .message { font-size: 14px; color: #6b5a52; line-height: 1.7; margin-bottom: 32px; }
    .btn-wrapper { text-align: center; margin-bottom: 32px; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.05em;
      padding: 14px 36px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
    }
    .divider { border: none; border-top: 1px solid #ede5db; margin: 28px 0; }
    .fallback {
      background: #fdf8f3;
      border: 1px solid #ede5db;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .fallback p { font-size: 12px; color: #9e8a80; line-height: 1.6; margin-bottom: 8px; }
    .fallback a { font-size: 11px; color: #8b4513; word-break: break-all; text-decoration: none; }
    .expiry {
      background: #fffbe6;
      border: 1px solid #e8d89a;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 28px;
    }
    .expiry p { font-size: 12px; color: #7a6a10; line-height: 1.6; }
    .footer { text-align: center; padding-top: 8px; }
    .footer p { font-size: 12px; color: #9e8a80; line-height: 1.8; }
    .footer a { color: #8b4513; text-decoration: none; }
    .footer .separator { color: #c9b8b0; margin: 0 6px; }
    .card-footer-strip {
      background: #fdf8f3;
      border-top: 1px solid #ede5db;
      padding: 16px 40px;
      text-align: center;
    }
    .card-footer-strip p { font-size: 11px; color: #b0978a; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="${process.env.FRONTEND_URL}/images/4RosesHeader.png" alt="Four Roses" />
    </div>
    <div class="card">
      <div class="card-banner">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto;">
          <tr>
            <td style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 28px; text-align: center; vertical-align: middle; font-size: 24px; line-height: 56px;">
              🔑
            </td>
          </tr>
        </table>
        <h1>${tr.title}</h1>
        <p>${tr.subtitle}</p>
      </div>
      <div class="card-body">
        <p class="greeting">${tr.greeting}</p>
        <p class="message">${tr.message}</p>
        <div class="btn-wrapper">
          <a href="${resetLink}" class="btn">${tr.cta}</a>
        </div>
        <div class="expiry">
          <p>⏳ &nbsp;${tr.expiry}</p>
        </div>
        <hr class="divider" />
        <div class="fallback">
          <p>${tr.fallbackTitle}</p>
          <a href="${resetLink}">${resetLink}</a>
        </div>
      </div>
      <div class="card-footer-strip">
        <p>${tr.footerNote}</p>
      </div>
    </div>
    <div class="footer" style="margin-top: 28px;">
      <p>
        <a href="${process.env.FRONTEND_URL}">Four Roses</a>
        <span class="separator">·</span>
        <a href="${process.env.FRONTEND_URL}/AboutUs/#contactUs">${tr.contact}</a>
      </p>
      <p style="margin-top: 8px; color: #b0978a;">${tr.rights}</p>
    </div>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: `Four Roses Recovery <noreply@fourroses.fignet.ca>`,
      to: email,
      subject: tr.subject,
      html,
    });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
