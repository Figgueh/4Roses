import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
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
import { UserAuth } from "connection/auth/authContext";
import { useTranslation } from "react-i18next";
import supabase from "connection/client";

function SignInBasic() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("error");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const { session, authLoading, signInUser } = UserAuth();
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  const handleSignInUser = async (event) => {
    event.preventDefault();
    setMessage("");

    let result = await signInUser(username, password, rememberMe);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setMessageColor("error");
      setMessage(result.error.message);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setForgotLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessageColor("error");
      setMessage(error.message);
    } else {
      setMessageColor("success");
      setMessage(t("Password reset email sent. Check your inbox."));
    }
    setForgotLoading(false);
  };

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  const [rememberMe, setRememberMe] = useState(false);
  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  if (authLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

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
                  {forgotMode ? t("Reset Password") : t("Sign in")}
                </MKTypography>
              </MKBox>

              <MKBox pt={4} pb={3} px={3}>
                {forgotMode ? (
                  /* ── Forgot password form ── */
                  <MKBox component="form" role="form" onSubmit={handleForgotPassword}>
                    <MKTypography variant="body2" color="text" mb={2}>
                      {t("Enter your email and we'll send you a reset link.")}
                    </MKTypography>
                    <MKBox mb={2}>
                      <MKInput
                        type="email"
                        label={t("Email")}
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
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
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? t("Sending...") : t("Send Reset Link")}
                      </MKButton>
                    </MKBox>
                    <MKBox>
                      {message && (
                        <MKAlert color={messageColor} sx={{ mt: 1.5 }}>
                          {message}
                        </MKAlert>
                      )}
                    </MKBox>
                    <MKBox mt={3} mb={1} textAlign="center">
                      <MKTypography
                        variant="button"
                        color="info"
                        fontWeight="medium"
                        textGradient
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          setForgotMode(false);
                          setMessage("");
                        }}
                      >
                        {t("Back to Sign in")}
                      </MKTypography>
                    </MKBox>
                  </MKBox>
                ) : (
                  /* ── Sign in form ── */
                  <MKBox component="form" role="form" onSubmit={handleSignInUser}>
                    <MKBox mb={2}>
                      <MKInput
                        type="email"
                        label={t("Email")}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                      />
                    </MKBox>
                    <MKBox mb={2}>
                      <MKInput
                        type="password"
                        label={t("Password")}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                      />
                    </MKBox>
                    <MKBox
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      ml={-1}
                    >
                      <MKBox display="flex" alignItems="center">
                        <Switch checked={rememberMe} onChange={handleSetRememberMe} />
                        <MKTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          onClick={handleSetRememberMe}
                          sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                        >
                          &nbsp;&nbsp;{t("Remember me")}
                        </MKTypography>
                      </MKBox>
                      <MKTypography
                        variant="button"
                        color="info"
                        fontWeight="medium"
                        textGradient
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          setForgotMode(true);
                          setMessage("");
                        }}
                      >
                        {t("Forgot password?")}
                      </MKTypography>
                    </MKBox>
                    <MKBox mt={4} mb={1}>
                      <MKButton type="submit" variant="gradient" color="info" fullWidth>
                        {t("Sign in")}
                      </MKButton>
                    </MKBox>
                    <MKBox>
                      {message && (
                        <MKAlert color={messageColor} sx={{ mt: 1.5 }}>
                          {message}
                        </MKAlert>
                      )}
                    </MKBox>
                    <MKBox mt={3} mb={1} textAlign="center">
                      <MKTypography variant="button" color="text">
                        {t("Don't have an account?")}{" "}
                        <MKTypography
                          component={Link}
                          to="/register"
                          variant="button"
                          color="info"
                          fontWeight="medium"
                          textGradient
                        >
                          {t("Sign up")}
                        </MKTypography>
                      </MKTypography>
                    </MKBox>
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

export default SignInBasic;
