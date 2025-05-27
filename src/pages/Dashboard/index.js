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
import supabase from "connection/client";

// Tabs
import ProfileTab from "./tabs/profile";
import CrudBasic from "./tabs/admin";

function Dashboard() {
  const navigate = useNavigate();
  const { session, signOut } = UserAuth();
  const [activeTab, setActiveTab] = useState(0);
  const handleTabType = (tab, newValue) => setActiveTab(newValue);
  const [account, setAccount] = useState();

  const handleSignOut = async (event) => {
    event.preventDefault();
    await signOut();
    navigate("/sign-in");
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: account, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        navigate("/sign-in", { state: { message: "your account wasn't created properly." } });
      }

      console.log(account);
      setAccount(account);
    };
    if (session?.user?.id) {
      checkAdmin();
    }
  }, []);

  return (
    <BaseLayout title="Account dashboard">
      <div>
        <span>Welcome {session?.user?.email}</span>
        <button onClick={handleSignOut}>Sign out</button>
      </div>
      <Container lg={3}>
        <Grid container item justifyContent="center" xs={12} lg={10} mx="auto">
          <AppBar position="static">
            <Tabs sx={{ minWidth: "100%" }} value={activeTab} onChange={handleTabType}>
              <Tab label="My Profile" />
              <Tab label="My Posts" />
              {account?.is_admin == true && <Tab label="Administation" />};
            </Tabs>
          </AppBar>
        </Grid>
      </Container>
      {activeTab === 0 && <ProfileTab />}
      {activeTab === 2 && <CrudBasic />}
    </BaseLayout>
  );
}

export default Dashboard;
