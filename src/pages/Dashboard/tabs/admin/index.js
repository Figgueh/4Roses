import React, { useState } from "react";

// @mui material components
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

// Tabs:
import PhotoUploader from "./PhotoUploader";
import ActivityEditor from "./ActivityEditor";
import ArticleGenerator from "./ArticleGenerator";

function AdminDash() {
  const [activeTab, setActiveTab] = useState(0);
  const handleTabType = (tab, newValue) => setActiveTab(newValue);

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tabs
            sx={{ maxHeight: "200px", borderColor: "divider", minWidth: "150px" }}
            orientation="vertical"
            value={activeTab}
            onChange={handleTabType}
          >
            <Tab label="Interior Photos" />
            <Tab label="Exterior Photos" />
            <Tab label="Activity Editor" />
            <Tab label="Article Generator" />
          </Tabs>
          <Box sx={{ flexGrow: 1 }}>
            {activeTab === 0 && <PhotoUploader album="interior" />}
            {activeTab === 1 && <PhotoUploader album="exterior" />}
            {activeTab === 2 && <ActivityEditor />}
            {activeTab === 3 && <ArticleGenerator />}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default AdminDash;
