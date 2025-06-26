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

function Dashboard() {
  const navigate = useNavigate();
  const { session, signOut } = UserAuth();
  const [activeTab, setActiveTab] = useState(0);
  const handleTabType = (tab, newValue) => setActiveTab(newValue);
  const [isAdmin, setIsAdmin] = useState();

  const handleSignOut = async (event) => {
    event.preventDefault();
    await signOut();
    navigate("/sign-in");
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
    <BaseLayout title="Account dashboard">
      <MKBox sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <MKBox>
          <span>Welcome {session?.user?.email}</span>
          <button onClick={handleSignOut}>Sign out</button>
        </MKBox>
        <Container lg={3}>
          <Grid container item justifyContent="center" xs={12} lg={10} mx="auto">
            <AppBar position="static">
              <Tabs sx={{ minWidth: "100%" }} value={activeTab} onChange={handleTabType}>
                <Tab label="My Profile" />
                <Tab label="My Posts" />
                {isAdmin == true && <Tab label="Administration" />};
              </Tabs>
            </AppBar>
          </Grid>
        </Container>
        {activeTab === 0 && <ProfileTab />}
        {activeTab === 2 && <AdminDash />}
      </MKBox>
    </BaseLayout>
  );
}

export default Dashboard;
