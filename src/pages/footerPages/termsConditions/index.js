import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import MKBox from "components/MKBox";
import DefaultNavbar from "components/DefaultNavbar";
import DefaultFooter from "components/Footers/DefaultFooter";
import bgImage from "assets/images/view/monchique.jpg";

import { routes } from "routes";
import footerRoutes from "footer.routes";

import SEO from "components/SEO";
import { useTranslation } from "react-i18next";

const serif = "'Cormorant Garamond', serif";
const brown = "#8b4513";
const brownFaint = "#fdf8f3";
const border = "1px solid #ede5db";

const sections = [
  {
    number: "01",
    title: "Booking & Reservations",
    body: `All bookings are subject to availability. A reservation is only confirmed upon receipt of the required deposit. We reserve the right to decline any reservation at our discretion. The minimum rental age is 21 years.`,
  },
  {
    number: "02",
    title: "Security Deposit & Damages",
    body: `A security deposit is required at the time of booking. We reserve the right to retain part or all of the security deposit if damage to the property caused by you or your party amounts to €500 or more. Any damage must be reported immediately. The cost of repair or replacement will be deducted from the deposit, with any excess charged to the guest.`,
    highlight: true,
  },
  {
    number: "03",
    title: "Cancellation Policy",
    body: `Cancellation terms vary depending on the booking platform used. Please refer to the platform through which you booked for the applicable cancellation policy. In all cases, cancellation must be submitted in writing.`,
  },
  {
    number: "04",
    title: "Intellectual Property",
    body: `All content, trademarks, graphics, photographs, and logos on this website are the property of the website owner and are protected by applicable intellectual property laws. Reproduction without prior written consent is strictly prohibited.`,
  },
  {
    number: "05",
    title: "User Obligations",
    body: `Users agree not to misuse the website, including but not limited to transmitting harmful code, attempting unauthorized access, or interfering with the normal functioning of the site. Guests are expected to treat the property with respect and adhere to all house rules.`,
  },
  {
    number: "06",
    title: "Limitation of Liability",
    body: `The website owner shall not be liable for any direct, indirect, or consequential damages arising from the use of this website or any linked resources. We are not responsible for loss of personal belongings during your stay.`,
  },
  {
    number: "07",
    title: "Changes to Terms",
    body: `We reserve the right to update these terms at any time without prior notice. Users are encouraged to review this page periodically for the latest information. Continued use of the site following any changes constitutes your acceptance of the new terms.`,
  },
];

function TermsConditions() {
  const { t } = useTranslation();
  const translatedRoutes = routes(t);
  const translatedFooterRoutes = footerRoutes(t);

  return (
    <>
      <SEO
        title={t("Terms & Conditions | Four Roses Alvor Villa")}
        description={t(
          "Read the terms and conditions for booking and staying at Four Roses villa in Alvor, Portugal, including reservations, deposits, cancellations, and guest responsibilities."
        )}
        type="website"
        structuredData={{
          "@type": "WebPage",
          name: t("Terms & Conditions | Four Roses Alvor Villa"),
          description: t(
            "Read the terms and conditions for booking and staying at Four Roses villa in Alvor, Portugal."
          ),
        }}
      />
      <DefaultNavbar routes={translatedRoutes} sticky />

      {/* ── Hero ── */}
      <Box
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
          pt: 13,
          pb: 6,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 640 }}>
            <Typography
              sx={{
                fontFamily: serif,
                fontSize: "11px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                mb: 2,
              }}
            >
              Four Roses Alvor Villa
            </Typography>
            <Typography
              sx={{
                fontFamily: serif,
                fontSize: { xs: "38px", md: "58px" },
                fontWeight: 600,
                color: "#fff",
                lineHeight: 1.05,
                mb: 2,
              }}
            >
              Terms &<br />
              Conditions
            </Typography>
            <Box sx={{ width: 48, height: 2, background: "rgba(255,255,255,0.3)", mb: 3 }} />
            <Typography
              sx={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.7,
                maxWidth: 480,
              }}
            >
              Please read these terms carefully before booking or using our website.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ── Introduction ── */}
      <Box sx={{ background: "#fff", borderBottom: border }}>
        <Container maxWidth="lg">
          <Box sx={{ py: { xs: 5, md: 6 } }}>
            <Typography
              sx={{
                fontFamily: serif,
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#c8b8b0",
                mb: 1.5,
              }}
            >
              Introduction
            </Typography>
            <Typography
              sx={{
                fontFamily: serif,
                fontSize: { xs: "22px", md: "28px" },
                fontWeight: 600,
                color: "#2c2420",
                lineHeight: 1.3,
                mb: 2,
              }}
            >
              4 Roses Alvor Villa terms & conditions.
            </Typography>
            <Typography sx={{ fontSize: "15px", color: "#4a3830", lineHeight: 1.9, mb: 3 }}>
              By accessing or using this site, you agree to comply with and be bound by the
              following terms and conditions. If you do not agree with any of these terms, you must
              not use our website or services.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.5,
                  background: "#fdf0e8",
                  border: "1px solid #e8c4a8",
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 1.5,
                }}
              >
                <Typography sx={{ fontSize: "16px", flexShrink: 0, mt: 0.1 }}>⚠️</Typography>
                <Typography sx={{ fontSize: "13px", color: "#4a3830", lineHeight: 1.7 }}>
                  <strong>By creating a booking through our website</strong>, you confirm that you
                  have read, understood, and agree to be bound by all of the following terms and
                  conditions.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ background: brownFaint, py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Sticky sidebar */}
            <Grid item xs={12} md={3}>
              <Box sx={{ position: { md: "sticky" }, top: "100px" }}>
                <Typography
                  sx={{
                    fontFamily: serif,
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#c8b8b0",
                    mb: 2,
                  }}
                >
                  Contents
                </Typography>
                {sections.map((s) => (
                  <Box
                    key={s.number}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                      cursor: "pointer",
                      "&:hover .toc-title": { color: brown },
                    }}
                    onClick={() =>
                      document
                        .getElementById(`section-${s.number}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  >
                    <Typography
                      sx={{ fontFamily: serif, fontSize: "11px", color: "#c8b8b0", minWidth: 20 }}
                    >
                      {s.number}
                    </Typography>
                    <Typography
                      className="toc-title"
                      sx={{
                        fontSize: "12px",
                        color: "#9e8a80",
                        transition: "color 0.2s",
                        ...(s.highlight && { color: brown, fontWeight: 600 }),
                      }}
                    >
                      {s.title}
                    </Typography>
                  </Box>
                ))}

                {/* Contact box */}
                <Box
                  sx={{
                    mt: 4,
                    p: 2.5,
                    background: "#fff",
                    border,
                    borderRadius: 2.5,
                    boxShadow: "0 2px 12px rgba(139,69,19,0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: serif,
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#2c2420",
                      mb: 0.5,
                    }}
                  >
                    Questions?
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#9e8a80", lineHeight: 1.6, mb: 1 }}>
                    Contact us directly for any clarification.
                  </Typography>
                  <Typography
                    component="a"
                    href={`mailto:${process.env.REACT_APP_ADMIN_EMAIL}`}
                    sx={{
                      fontSize: "11px",
                      color: brown,
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {process.env.REACT_APP_ADMIN_EMAIL}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Sections */}
            <Grid item xs={12} md={9}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {sections.map((s) => (
                  <Box
                    id={`section-${s.number}`}
                    key={s.number}
                    sx={{
                      background: "#fff",
                      border: s.highlight ? "1px solid #e8c4a8" : border,
                      borderRadius: 3,
                      p: { xs: 3, md: 4 },
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: s.highlight
                        ? "0 4px 24px rgba(139,69,19,0.10)"
                        : "0 2px 12px rgba(139,69,19,0.05)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: "15%",
                        height: "70%",
                        width: "3px",
                        background: s.highlight ? brown : "#ede5db",
                        borderRadius: "0 2px 2px 0",
                      },
                    }}
                  >
                    {s.highlight && (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          background: "#fdf0e8",
                          border: "1px solid #e8c4a8",
                          borderRadius: 1,
                          px: 1.5,
                          py: 0.3,
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: brown,
                          }}
                        >
                          Important
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 1.5 }}>
                      <Typography
                        sx={{
                          fontFamily: serif,
                          fontSize: "11px",
                          letterSpacing: "0.15em",
                          color: "#c8b8b0",
                          mt: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        {s.number}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: serif,
                          fontSize: { xs: "20px", md: "24px" },
                          fontWeight: 600,
                          color: s.highlight ? brown : "#2c2420",
                          lineHeight: 1.2,
                        }}
                      >
                        {s.title}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "#4a3830",
                        lineHeight: 1.9,
                        pl: { md: "36px" },
                      }}
                    >
                      {s.body}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={translatedFooterRoutes} />
      </MKBox>
    </>
  );
}

export default TermsConditions;
