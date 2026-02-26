// react-router-dom components
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

// Material Kit 2 React example components
import DefaultNavbar from "components/DefaultNavbar";
import CenteredFooter from "components/Footers/CenteredFooter";

// Routes
import { routes } from "routes";

// Images
import bgImage from "assets/images/beach/reservado.jpg";
import { UserAuth } from "connection/auth/authContext";

import { useTranslation } from "react-i18next";

function ConfirmEmail() {
  const navigate = useNavigate();
  const { session, authLoading } = UserAuth();
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  useEffect(() => {
    if (authLoading) return;
    // If the user's email is already confirmed, send them to dashboard
    if (session?.user?.email_confirmed_at) {
      navigate("/dashboard");
    }
  }, [session, authLoading]);

  return (
    <>
      <DefaultNavbar
        routes={translatedRoutes}
        action={{
          type: "external",
          route: "https://www.vrbo.com/2905236?dateless=true",
          label: `${t("book")}`,
          color: "info",
        }}
        transparent
        light
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
                <MKTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                  Check your email
                </MKTypography>
              </MKBox>

              <MKBox pt={4} pb={3} px={3} textAlign="center">
                {/* Envelope icon */}
                <MKBox
                  sx={{
                    fontSize: "56px",
                    lineHeight: 1,
                    mb: 2,
                    filter: "grayscale(0.1)",
                  }}
                >
                  ✉️
                </MKBox>

                <MKTypography variant="body1" color="text" mb={1}>
                  We&apos;ve sent a confirmation link to your email address.
                </MKTypography>

                <MKTypography variant="body2" color="text" mb={3}>
                  Please open it and click the link to activate your account. The link expires in{" "}
                  <strong>24 hours</strong>.
                </MKTypography>

                <MKBox
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    p: 2,
                    mb: 3,
                    textAlign: "left",
                  }}
                >
                  <MKTypography
                    variant="caption"
                    color="text"
                    display="block"
                    mb={0.5}
                    fontWeight="bold"
                  >
                    Can&apos;t find the email?
                  </MKTypography>
                  <MKTypography variant="caption" color="text" display="block">
                    • Check your spam or junk folder
                  </MKTypography>
                  <MKTypography variant="caption" color="text" display="block">
                    • Make sure you entered the correct email address
                  </MKTypography>
                  <MKTypography variant="caption" color="text" display="block">
                    • Allow a few minutes for the email to arrive
                  </MKTypography>
                </MKBox>

                <MKButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  onClick={() => navigate("/sign-in")}
                >
                  Back to Sign In
                </MKButton>

                <MKBox mt={2}>
                  <MKTypography variant="caption" color="text">
                    Wrong email?{" "}
                    <MKTypography
                      component="span"
                      variant="caption"
                      color="info"
                      fontWeight="medium"
                      sx={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => navigate("/register")}
                    >
                      Sign up again
                    </MKTypography>
                  </MKTypography>
                </MKBox>
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

export default ConfirmEmail;
