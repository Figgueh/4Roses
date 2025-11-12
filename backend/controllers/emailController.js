import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await resend.emails.send({
      from: `4 Roses Contact <Contact@fourroses.fignet.ca>`,
      to: "JoeFigueiras@gmail.com",
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
