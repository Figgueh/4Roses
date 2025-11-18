import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "connection/auth/authContext";

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";

// Layout imports
import BaseLayout from "components/BaseLayout";

// Database connection imports
import { checkAdmin } from "connection/users/checkAdmin";

// Tabs
import ProfileTab from "./tabs/profile";
import AdminDash from "./tabs/admin";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";

import { useTranslation } from "react-i18next";

function Dashboard() {
  const navigate = useNavigate();
  const { session, signOut } = UserAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useTranslation();

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleSignOut = async (event) => {
    event.preventDefault();
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsAdmin(await checkAdmin(session.user.id));
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, []);

  return (
    <BaseLayout title={t("Account dashboard")}>
      <MKBox sx={{ flex: 1, display: "flex", flexDirection: "column", mt: 2 }}>
        {/* Top Bar */}
        <MKBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2.5}
          mb={3}
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            borderLeft: "4px solid #4a80f6",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>
            {t("Welcome")}, <strong>{session?.user?.email}</strong>
          </span>

          <MKButton
            variant="gradient"
            color="dark"
            size="small"
            onClick={handleSignOut}
            sx={{ borderRadius: 2, px: 2.4 }}
          >
            {t("sign out")}
          </MKButton>
        </MKBox>

        {/* Tabs Wrapper */}
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={10}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  TabIndicatorProps={{ style: { display: "none" } }} // remove indicator
                  sx={{
                    mb: 0,
                    borderBottom: "none",
                    "& .MuiTabs-flexContainer": {
                      borderBottom: "none",
                    },
                    "& .MuiTab-root": {
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      "&.Mui-selected": {
                        backgroundColor: "action.selected",
                      },
                    },
                  }}
                >
                  <Tab label={t("My Profile")} />
                  {isAdmin && <Tab label={t("Administration")} />}
                </Tabs>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Tab Content */}
        <MKBox mt={2}>
          {activeTab === 0 && <ProfileTab />}
          {activeTab === 1 && isAdmin && <AdminDash />}
        </MKBox>
      </MKBox>
    </BaseLayout>
  );
}

export default Dashboard;
