import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import villaPhoto from "assets/images/property/exterior/backViewBright.JPG";

const serif = "'Cormorant Garamond', serif";
const brown = "#8b4513";
const brownFaint = "#fdf8f3";
const border = "1px solid #ede5db";

const sections = [
  {
    heading: "The Villa",
    body: "Four Roses Alvor Villa sits in the quiet residential area of Montes de Alvor, just outside the picturesque fishing town of Alvor. This fantastic 5-bedroom property offers free Wi-Fi and Cable, a private swimming pool, a spacious orchard and cactus garden — all fully enclosed by a wall and iron railings. Free parking on site. An excellent choice for a relaxing family holiday in the sun.",
  },
  {
    heading: "Location",
    body: "Nestled between the fishing village of Alvor (2 km) and the city of Portimão, the villa sits in a calm residential neighbourhood of privately owned homes. Downtown Portimão is home to Aqua Shopping Center, unlimited restaurants, and every amenity you could need.",
  },
  {
    heading: "Things To Do",
    body: "Walk along the coastal cliffs in Portimão — an absolute must. Explore Monchique mountain, a haven for walkers and birdwatchers. Visit the lovely fishing town of Ferragudo to the east. Try skydiving at Aerodrome de Portimão (750 m) or take a spin at the International Karting Track (15 min drive). Enjoy the 3.5 km boardwalk stretching from Praia dos 3 Irmãos to Foz da Ribeira de Odiaxere.",
  },
  {
    heading: "Beaches",
    body: "The closest beach is Alvor, followed by Prainha, Meia Praia and the famous Praia da Rocha. The gentle south coast shoreline is perfect for swimming, beachcombing and sunbathing with ample space for all. The wilder west coast offers dramatic cliffs and excellent surfing and bodyboarding.",
  },
  {
    heading: "Getting Here",
    body: "The nearest airport is Faro, a 46-minute drive via the A22 — or take the train/bus in about an hour. Car rental is recommended and best reserved in advance, especially in high season. Lisbon Airport is roughly 3 hours by bus or train.",
  },
];
import SmokeFreeOutlined from "@mui/icons-material/SmokeFreeOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import ChildFriendlyOutlined from "@mui/icons-material/ChildFriendlyOutlined";
import LoginOutlined from "@mui/icons-material/LoginOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import PetsOutlined from "@mui/icons-material/PetsOutlined";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EuroIcon from "@mui/icons-material/Euro";

const houseRules = [
  { icon: <LoginOutlined />, label: "Check-in", value: "After 4:00 PM" },
  { icon: <LogoutOutlined />, label: "Check-out", value: "Before 11:00 AM" },
  { icon: <BadgeOutlined />, label: "Minimum age", value: "21 years" },
  { icon: <ChildFriendlyOutlined />, label: "Children", value: "Allowed · child friendly" },
  { icon: <EventBusyIcon />, label: "Events", value: "Not allowed" },
  { icon: <PetsOutlined />, label: "Pets", value: "Not allowed" },
  { icon: <SmokeFreeOutlined />, label: "Smoking", value: "Not permitted" },
  { icon: <EuroIcon />, label: "Cash Payment", value: "Possible upon request" },
];

// eslint-disable-next-line react/prop-types
function FadeInBox({ children, delay = 0, sx = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: 0,
        transform: "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// eslint-disable-next-line react/prop-types
function SectionHeading({ label, title }) {
  return (
    <FadeInBox sx={{ mb: { xs: 4, md: 5 } }}>
      <Typography
        sx={{
          fontFamily: serif,
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#c8b8b0",
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: serif,
          fontSize: { xs: "30px", md: "42px" },
          fontWeight: 600,
          color: "#2c2420",
          lineHeight: 1.1,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ width: 40, height: 2, background: brown, opacity: 0.35 }} />
    </FadeInBox>
  );
}

export default function About() {
  return (
    <Box sx={{ background: brownFaint, position: "relative" }}>
      {/* Fade from white */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          background: "linear-gradient(to bottom, #ffffff, transparent)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <Box sx={{ borderTop: border }} />

      {/* ── About sections ── */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 4, md: 6 } }}>
        <SectionHeading label="Algarve · Portugal" title="About the Villa" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {sections.map((s, i) => {
            const isHero = i === 0;
            return (
              <FadeInBox
                key={s.heading}
                delay={i * 0.07}
                sx={{ gridColumn: isHero ? { md: "1 / -1" } : "auto" }}
              >
                <Box
                  sx={{
                    background: "#fff",
                    border,
                    borderRadius: 3,
                    p: { xs: 3, md: isHero ? 5 : 4 },
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 2px 16px rgba(139,69,19,0.05)",
                    transition: "box-shadow 0.25s",
                    "&:hover": { boxShadow: "0 8px 32px rgba(139,69,19,0.10)" },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "15%",
                      height: "70%",
                      width: "3px",
                      background: brown,
                      borderRadius: "0 2px 2px 0",
                      opacity: 0.35,
                    },
                  }}
                >
                  {isHero && (
                    <Box
                      component="img"
                      src={villaPhoto}
                      alt="Villa"
                      sx={{
                        display: { xs: "none", xl: "block" },
                        position: "absolute",
                        top: 0,
                        right: 0,
                        height: "100%",
                        width: "50%",
                        objectFit: "cover",
                        objectPosition: "center",
                        zIndex: 0,
                        maskImage:
                          "linear-gradient(to right, transparent 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,1) 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to right, transparent 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,1) 100%)",
                      }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontFamily: serif,
                      fontSize: isHero ? { xs: "26px", md: "34px" } : { xs: "20px", md: "24px" },
                      fontWeight: 600,
                      color: brown,
                      lineHeight: 1.15,
                      mb: 2,
                    }}
                  >
                    {s.heading}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: isHero ? "16px" : "14px",
                      color: "#4a3830",
                      lineHeight: 1.85,
                      maxWidth: isHero ? 720 : "100%",
                    }}
                  >
                    {s.body}
                  </Typography>
                </Box>
              </FadeInBox>
            );
          })}
        </Box>
      </Container>

      {/* ── Divider ── */}
      <Box sx={{ borderTop: border, mx: { xs: 3, md: 8 }, my: { xs: 4, md: 6 } }} />

      {/* ── House Rules ── */}
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        <SectionHeading label="Stay Requirements" title="House Rules" />

        <FadeInBox>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            {houseRules.map((r) => (
              <Box
                key={r.label}
                sx={{
                  background: "#fff",
                  border,
                  borderRadius: 2.5,
                  p: 2.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  boxShadow: "0 1px 8px rgba(139,69,19,0.04)",
                }}
              >
                <Typography sx={{ fontSize: "20px", lineHeight: 1, mt: 0.2, flexShrink: 0 }}>
                  {r.icon}
                </Typography>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9e8a80",
                      mb: 0.3,
                    }}
                  >
                    {r.label}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "#2c2420", fontWeight: 500 }}>
                    {r.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </FadeInBox>

        {/* Damage note */}
        <FadeInBox delay={0.1}>
          <Box
            sx={{
              mt: 2,
              background: "#fff8f0",
              border: "1px solid #e8c4a8",
              borderRadius: 2.5,
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "18px", flexShrink: 0, mt: 0.1 }}>⚠️</Typography>
            <Typography pt={0.5} sx={{ fontSize: "13px", color: "#4a3830", lineHeight: 1.7 }}>
              <strong>Damage & Incidentals: </strong>
              You will be responsible for any damage to the rental property caused by you or your
              party during your stay.
            </Typography>
          </Box>
        </FadeInBox>
      </Container>
      {/* Fade to white */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: "linear-gradient(to bottom, transparent, #ffffff)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}
