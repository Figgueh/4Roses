import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

import DefaultNavbar from "components/DefaultNavbar";
import DefaultFooter from "components/Footers/DefaultFooter";

import { routes } from "routes";
import footerRoutes from "footer.routes";

import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";

import bgImage from "assets/images/castel/dev.jpg";

import { useState } from "react";
import { useTranslation } from "react-i18next";

function ContactDeveloper() {
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", form);
    setStatus("Message sent! Thank you.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <DefaultNavbar routes={translatedRoutes} sticky />

      {/* Hero Section */}
      <MKBox
        minHeight="75vh"
        display="flex"
        alignItems="center"
        sx={{
          backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <MKTypography
                variant="h1"
                color="white"
                sx={({ breakpoints, typography: { size } }) => ({
                  [breakpoints.down("md")]: {
                    fontSize: size["3xl"],
                  },
                })}
              >
                Contact the Web Developer
              </MKTypography>
              <MKTypography variant="body1" color="white" opacity={0.8} mt={1} mb={3}>
                Have questions or suggestions? Send me a message and I’ll get back to you promptly.
              </MKTypography>
            </Grid>
          </Grid>
        </Container>
      </MKBox>

      {/* Contact Form */}
      <Card
        sx={{
          p: 2,
          mx: { xs: 2, lg: 3 },
          mt: -8,
          mb: 4,
          boxShadow: ({ boxShadows: { xxl } }) => xxl,
        }}
      >
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3} mt={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange("name")}
                    InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1 }} /> }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    placeholder="you@example.com"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1 }} /> }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    placeholder="Your message..."
                    multiline
                    minRows={4}
                    value={form.message}
                    onChange={handleChange("message")}
                    InputProps={{
                      startAdornment: <MessageIcon sx={{ ml: 1.5, mt: 2 }} />,
                      sx: { alignItems: "flex-start" },
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} textAlign="center">
                  <MKButton type="submit" color="info" size="large">
                    Send Message
                  </MKButton>
                </Grid>
                {status && (
                  <Grid item xs={12} textAlign="center">
                    <MKTypography color="success">{status}</MKTypography>
                  </Grid>
                )}
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Card>

      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}

export default ContactDeveloper;
