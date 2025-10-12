import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "connection/auth/authContext";

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

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
  const handleTabType = (tab, newValue) => setActiveTab(newValue);
  const [isAdmin, setIsAdmin] = useState();
  const { t } = useTranslation();

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
      <MKBox sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <MKBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <span style={{ fontWeight: 500, fontSize: "1rem" }}>
            {t("Welcome")}, <strong>{session?.user?.email}</strong>
          </span>
          <MKButton variant="gradient" color="light" size="small" onClick={handleSignOut}>
            {t("sign out")}
          </MKButton>
        </MKBox>

        <Container lg={3}>
          <Grid container item justifyContent="center" xs={12} lg={10} mx="auto">
            <AppBar position="static">
              <Tabs sx={{ minWidth: "100%" }} value={activeTab} onChange={handleTabType}>
                <Tab label="My Profile" />
                {isAdmin == true && <Tab label="Administration" />};
              </Tabs>
            </AppBar>
          </Grid>
        </Container>
        {activeTab === 0 && <ProfileTab />}
        {activeTab === 1 && <AdminDash />}
      </MKBox>
    </BaseLayout>
  );
}

export default Dashboard;
