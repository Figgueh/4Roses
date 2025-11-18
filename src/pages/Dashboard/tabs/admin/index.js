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
import PhotoUploader from "./PhotoUploader";
import VideoUploader from "./VideoUploader";
import ActivityEditor from "./ActivityEditor";
import ArticleGenerator from "./ArticleGenerator";
import AmenitiesEditor from "./AmenitiesEditor";

function AdminDash() {
  const [activeTool, setActiveTool] = useState("interior");
  const [openPhotos, setOpenPhotos] = useState(true);

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
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
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
          {/* Photos Group */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenPhotos(!openPhotos)}>
              <ListItemText primary="Media Manager" />
              {openPhotos ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={openPhotos} timeout="auto" unmountOnExit>
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
            </List>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeTool === "videos"}
                sx={{ pl: 4 }}
                onClick={() => setActiveTool("videos")}
              >
                <ListItemText primary="Videos" />
              </ListItemButton>
            </ListItem>
          </Collapse>

          {/* Other tools */}

          <ListItem disablePadding>
            <ListItemButton
              selected={activeTool === "amenities"}
              onClick={() => setActiveTool("amenities")}
            >
              <ListItemText primary="Amenities Editor" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={activeTool === "activities"}
              onClick={() => setActiveTool("activities")}
            >
              <ListItemText primary="Activity Editor" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              selected={activeTool === "articles"}
              onClick={() => setActiveTool("articles")}
            >
              <ListItemText primary="Article Generator" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: 4 }}>{renderTool()}</Box>
    </Box>
  );
}

export default AdminDash;
