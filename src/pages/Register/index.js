// react-router-dom components
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKInput from "components/MKInput";
import MKButton from "components/MKButton";

// Material Kit 2 React example components
import DefaultNavbar from "components/DefaultNavbar";
import SimpleFooter from "components/Footers/SimpleFooter";

// Material Kit 2 React page layout routes
import { routes } from "routes";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import { UserAuth } from "connection/auth/authContext";

import { useTranslation } from "react-i18next";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { session, authLoading, signUpUser } = UserAuth();
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  const handleSignUpUser = async (event) => {
    event.preventDefault();
    setMessage("");

    const result = await signUpUser(email, password);

    if (result.success) {
      setMessage("User account created!");
      navigate("/dashboard");
    }
    if (!result.success) {
      setMessage(result.error.message);
    }
  };

  useEffect(() => {
    // check to see if the user is already signed in.
    if (authLoading) {
      return <p className="text-center text-gray-500">Loading...</p>;
    }
    if (session) navigate("/dashboard");
  }, []);

  return (
    <>
      <DefaultNavbar
        routes={translatedRoutes}
        action={{
          type: "external",
          route: "https://www.creative-tim.com/product/material-kit-react",
          label: "free download",
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
                  Account creation
                </MKTypography>
                <Grid container spacing={2} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
                  {message && <>{message}</>}
                </Grid>
              </MKBox>
              <MKBox pt={4} pb={3} px={3}>
                <MKBox component="form" role="form" onSubmit={handleSignUpUser}>
                  <MKBox mb={2}>
                    <MKInput
                      type="email"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="password"
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                    />
                  </MKBox>
                  <MKBox mt={4} mb={1}>
                    <MKButton type="submit" variant="gradient" color="info" fullWidth>
                      Create account
                    </MKButton>
                  </MKBox>
                  <MKBox mt={3} mb={1} textAlign="center">
                    <MKTypography variant="button" color="text">
                      already have an account?{" "}
                      <MKTypography
                        component={Link}
                        to="/sign-in"
                        variant="button"
                        color="info"
                        fontWeight="medium"
                        textGradient
                      >
                        Login
                      </MKTypography>
                    </MKTypography>
                  </MKBox>
                </MKBox>
              </MKBox>
            </Card>
          </Grid>
        </Grid>
      </MKBox>
      <MKBox width="100%" position="absolute" zIndex={2} bottom="1.625rem">
        <SimpleFooter light />
      </MKBox>
    </>
  );
}

export default Register;
