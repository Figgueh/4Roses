import React, { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import {
  ExpandLess,
  ExpandMore,
  PhotoLibraryOutlined,
  VideoLibraryOutlined,
  ImageOutlined,
  CalendarMonthOutlined,
  BlockOutlined,
  TuneOutlined,
  ArticleOutlined,
  StarOutlined,
  EmojiNatureOutlined,
  AutoStoriesOutlined,
} from "@mui/icons-material";

// Tools
import PhotoUploader from "./media/PhotoUploader";
import VideoUploader from "./media/VideoUploader";
import ActivityEditor from "./content/ActivityEditor";
import ArticleGenerator from "./content/ArticleGenerator";
import AmenitiesEditor from "./content/AmenitiesEditor";
import PriceAdjuster from "./reservations/PriceAdjuster";
import ReservationManager from "./reservations/ReservationManager";
import DateBlocker from "./reservations/DateBlocker";
import AboutEditor from "./content/AboutEditor";

const serif = "'Cormorant Garamond', serif";
const brown = "#8b4513";
const brownFaint = "#fdf8f3";
const border = "1px solid #ede5db";

const NAV = [
  {
    key: "media",
    label: "Media",
    icon: <PhotoLibraryOutlined sx={{ fontSize: 16 }} />,
    items: [
      { key: "interior", label: "Interior Photos", icon: <ImageOutlined sx={{ fontSize: 14 }} /> },
      { key: "exterior", label: "Exterior Photos", icon: <ImageOutlined sx={{ fontSize: 14 }} /> },
      { key: "videos", label: "Videos", icon: <VideoLibraryOutlined sx={{ fontSize: 14 }} /> },
    ],
  },
  {
    key: "reservations",
    label: "Reservations",
    icon: <CalendarMonthOutlined sx={{ fontSize: 16 }} />,
    items: [
      {
        key: "reservation manager",
        label: "Reservations",
        icon: <CalendarMonthOutlined sx={{ fontSize: 14 }} />,
      },
      { key: "date blocker", label: "Date Blocker", icon: <BlockOutlined sx={{ fontSize: 14 }} /> },
      {
        key: "price manager",
        label: "Price Adjustments",
        icon: <TuneOutlined sx={{ fontSize: 14 }} />,
      },
    ],
  },
  {
    key: "content",
    label: "Content",
    icon: <ArticleOutlined sx={{ fontSize: 16 }} />,
    items: [
      { key: "about", label: "about", icon: <AutoStoriesOutlined sx={{ fontSize: 14 }} /> },
      { key: "amenities", label: "Amenities", icon: <StarOutlined sx={{ fontSize: 14 }} /> },
      {
        key: "activities",
        label: "Activities",
        icon: <EmojiNatureOutlined sx={{ fontSize: 14 }} />,
      },
      {
        key: "articles",
        label: "Article Generator",
        icon: <ArticleOutlined sx={{ fontSize: 14 }} />,
      },
    ],
  },
];

const TOOL_LABELS = {
  interior: "Interior Photos",
  exterior: "Exterior Photos",
  videos: "Videos",
  "reservation manager": "Reservations",
  "date blocker": "Date Blocker",
  "price manager": "Price Adjustments",
  about: "About Section",
  amenities: "Amenities",
  activities: "Activities",
  articles: "Article Generator",
};

function renderTool(activeTool) {
  switch (activeTool) {
    case "interior":
      return <PhotoUploader album="interior" />;
    case "exterior":
      return <PhotoUploader album="exterior" />;
    case "videos":
      return <VideoUploader />;
    case "amenities":
      return <AmenitiesEditor />;
    case "activities":
      return <ActivityEditor />;
    case "articles":
      return <ArticleGenerator />;
    case "about":
      return <AboutEditor />;
    case "reservation manager":
      return <ReservationManager />;
    case "date blocker":
      return <DateBlocker />;
    case "price manager":
      return <PriceAdjuster />;
    default:
      return null;
  }
}

function AdminDash() {
  const [activeTool, setActiveTool] = useState("interior");
  const [openSections, setOpenSections] = useState({
    media: true,
    reservations: false,
    content: false,
  });

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeSection = NAV.find((s) => s.items.some((i) => i.key === activeTool));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: brownFaint }}>
      {/* ── Sidebar ── */}
      <Box
        sx={{
          width: 236,
          minWidth: 236,
          flexShrink: 0,
          background: "#fff",
          borderRight: border,
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 12px rgba(139,69,19,0.06)",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 3, pt: 3, pb: 2.5, borderBottom: border }}>
          <Typography
            sx={{
              fontFamily: serif,
              fontSize: "22px",
              fontWeight: 600,
              color: brown,
              letterSpacing: "0.04em",
              lineHeight: 1.2,
            }}
          >
            Four Roses
          </Typography>
          <Typography
            sx={{
              fontSize: "10px",
              color: "#b0978a",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              mt: 0.3,
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>

        {/* Nav */}
        <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
          {NAV.map((section) => (
            <Box key={section.key} sx={{ mb: 0.5 }}>
              {/* Section header */}
              <Box
                onClick={() => toggleSection(section.key)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 3,
                  py: 1,
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": { background: brownFaint },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ color: openSections[section.key] ? brown : "#b0978a" }}>
                    {section.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: openSections[section.key] ? brown : "#9e8a80",
                    }}
                  >
                    {section.label}
                  </Typography>
                </Box>
                <Box sx={{ color: "#b0978a", display: "flex" }}>
                  {openSections[section.key] ? (
                    <ExpandLess sx={{ fontSize: 16 }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 16 }} />
                  )}
                </Box>
              </Box>

              {/* Section items */}
              <Collapse in={openSections[section.key]} timeout="auto" unmountOnExit>
                <Box sx={{ pb: 1 }}>
                  {section.items.map((item) => {
                    const isActive = activeTool === item.key;
                    return (
                      <Box
                        key={item.key}
                        onClick={() => setActiveTool(item.key)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 3,
                          pl: 4.5,
                          py: 0.9,
                          cursor: "pointer",
                          position: "relative",
                          background: isActive ? "#fdf0e8" : "transparent",
                          "&:hover": { background: isActive ? "#fdf0e8" : brownFaint },
                          "&::before": isActive
                            ? {
                                content: '""',
                                position: "absolute",
                                left: 0,
                                top: "20%",
                                height: "60%",
                                width: 3,
                                background: brown,
                                borderRadius: "0 2px 2px 0",
                              }
                            : {},
                        }}
                      >
                        <Box sx={{ color: isActive ? brown : "#9e8a80" }}>{item.icon}</Box>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: isActive ? brown : "#4a3830",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, borderTop: border }}>
          <Typography sx={{ fontSize: "11px", color: "#c8b8b0" }}>© 2026 Four Roses</Typography>
        </Box>
      </Box>

      {/* ── Main content ── */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <Box
          sx={{
            height: 56,
            background: "#fff",
            borderBottom: border,
            display: "flex",
            alignItems: "center",
            px: 4,
            gap: 1.5,
            flexShrink: 0,
            boxShadow: "0 1px 8px rgba(139,69,19,0.04)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {activeSection && (
              <>
                <Typography sx={{ fontSize: "12px", color: "#b0978a" }}>
                  {activeSection.label}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#c8b8b0" }}>·</Typography>
              </>
            )}
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#2c2420" }}>
              {TOOL_LABELS[activeTool] || activeTool}
            </Typography>
          </Box>
        </Box>

        {/* Tool area */}
        <Box
          sx={{
            flex: 1,
            overflowX: activeTool === "reservation manager" ? "auto" : "hidden",
            overflowY: "auto",
          }}
        >
          {renderTool(activeTool)}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDash;
