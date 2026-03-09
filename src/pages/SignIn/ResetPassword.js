import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKInput from "components/MKInput";
import MKButton from "components/MKButton";
import MKAlert from "components/MKAlert";
import DefaultNavbar from "components/DefaultNavbar";
import CenteredFooter from "components/Footers/CenteredFooter";
import { routes } from "routes";
import bgImage from "assets/images/beach/reservado.jpg";
import supabase from "connection/client";
import { useTranslation } from "react-i18next";

function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("error");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  // Supabase fires an AUTH_TOKEN_REFRESHED / PASSWORD_RECOVERY event
  // when the user lands here via the reset link
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirm) {
      setMessageColor("error");
      setMessage(t("Passwords do not match."));
      return;
    }

    if (password.length < 6) {
      setMessageColor("error");
      setMessage(t("Password must be at least 6 characters."));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessageColor("error");
      setMessage(error.message);
    } else {
      setMessageColor("success");
      setMessage(t("Password updated! Redirecting..."));
      setTimeout(() => navigate("/sign-in"), 2000);
    }
    setLoading(false);
  };

  return (
    <>
      <DefaultNavbar
        routes={translatedRoutes}
        action={{
          type: "external",
          route: "https://www.vrbo.com/en-ca/cottage-rental/p2905236vb",
          label: t("book"),
          color: "info",
        }}
      />
      <MKBox
        position="absolute"
        top={0}
        left={0}
        zIndex={1}
        width="100%"
        minHeight="100vh"
        sx={{
          backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <MKBox px={1} width="100%" height="100vh" mx="auto" position="relative" zIndex={2}>
        <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            <Card>
              <MKBox
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                mx={2}
                mt={-3}
                p={2}
                mb={1}
                textAlign="center"
              >
                <MKTypography variant="h4" fontWeight="medium" color="white" mt={1} mb={1}>
                  {t("Set New Password")}
                </MKTypography>
              </MKBox>

              <MKBox pt={4} pb={3} px={3}>
                {!validSession ? (
                  <MKBox textAlign="center" py={2}>
                    <MKTypography variant="body2" color="text">
                      {t("Waiting for reset link verification...")}
                    </MKTypography>
                  </MKBox>
                ) : (
                  <MKBox component="form" role="form" onSubmit={handleSubmit}>
                    <MKBox mb={2}>
                      <MKInput
                        type="password"
                        label={t("New Password")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        required
                      />
                    </MKBox>
                    <MKBox mb={2}>
                      <MKInput
                        type="password"
                        label={t("Confirm Password")}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        fullWidth
                        required
                      />
                    </MKBox>
                    <MKBox mt={4} mb={1}>
                      <MKButton
                        type="submit"
                        variant="gradient"
                        color="info"
                        fullWidth
                        disabled={loading}
                      >
                        {loading ? t("Updating...") : t("Update Password")}
                      </MKButton>
                    </MKBox>
                    {message && (
                      <MKAlert color={messageColor} sx={{ mt: 1.5 }}>
                        {message}
                      </MKAlert>
                    )}
                  </MKBox>
                )}
              </MKBox>
            </Card>
          </Grid>
        </Grid>
      </MKBox>
      <MKBox width="100%" position="absolute" zIndex={2}>
        <CenteredFooter />
      </MKBox>
    </>
  );
}

export default ResetPassword;
