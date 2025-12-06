import React, { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

// Tools
import PhotoUploader from "./media/PhotoUploader";
import VideoUploader from "./media/VideoUploader";
import ActivityEditor from "./content/ActivityEditor";
import ArticleGenerator from "./content/ArticleGenerator";
import AmenitiesEditor from "./content/AmenitiesEditor";
import PriceAdjuster from "./reservations/PriceAdjuster";
import ReservationManager from "./reservations/ReservationManager";

function AdminDash() {
  const [activeTool, setActiveTool] = useState("interior");

  // Collapsible sections
  const [openMedia, setOpenMedia] = useState(false);
  const [openContent, setOpenContent] = useState(false);
  const [openReservations, setOpenReservations] = useState(false);

  const renderTool = () => {
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
      case "reservation manager":
        return <ReservationManager />;
      case "price manager":
        return <PriceAdjuster />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minWidth: activeTool === "reservation manager" ? "1600px" : "100%",
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 250,
          minWidth: 250,
          maxWidth: 250,
          flexShrink: 0,
          backgroundColor: "#fff",
          borderRight: "1px solid #ddd",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Admin Dashboard
        </Typography>
        <Divider />

        <List component="nav" sx={{ mt: 1 }}>
          {/* Media Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenMedia(!openMedia)}>
              <ListItemText primary="Media Manager" />
              {openMedia ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openMedia} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                selected={activeTool === "interior"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("interior")}
              >
                <ListItemText primary="Interior Photos" />
              </ListItemButton>
              <ListItemButton
                selected={activeTool === "exterior"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("exterior")}
              >
                <ListItemText primary="Exterior Photos" />
              </ListItemButton>
              <ListItemButton
                selected={activeTool === "videos"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("videos")}
              >
                <ListItemText primary="Videos" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Reservations Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenReservations(!openReservations)}>
              <ListItemText primary="Reservations" />
              {openReservations ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openReservations} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                selected={activeTool === "reservation manager"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("reservation manager")}
              >
                <ListItemText primary="Reservations" />
              </ListItemButton>
              <ListItemButton
                selected={activeTool === "price manager"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("price manager")}
              >
                <ListItemText primary="Price Adjustments" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Content Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenContent(!openContent)}>
              <ListItemText primary="Content Manager" />
              {openContent ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openContent} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                selected={activeTool === "amenities"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("amenities")}
              >
                <ListItemText primary="Amenities Editor" />
              </ListItemButton>
              <ListItemButton
                selected={activeTool === "activities"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("activities")}
              >
                <ListItemText primary="Activity Editor" />
              </ListItemButton>
              <ListItemButton
                selected={activeTool === "articles"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("articles")}
              >
                <ListItemText primary="Article Generator" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: 4 }}>{renderTool()}</Box>
    </Box>
  );
}

export default AdminDash;
