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
import CenteredFooter from "components/Footers/CenteredFooter";

// Material Kit 2 React page layout routes
import { routes } from "routes";

// Images
import bgImage from "assets/images/beach/reservado.jpg";
import { UserAuth } from "connection/auth/authContext";

import { useTranslation } from "react-i18next";
import { Alert, AlertTitle } from "@mui/material";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [message, setMessage] = useState("");
  const { session, authLoading, signUpUser } = UserAuth();
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  const handleSignUpUser = async (event) => {
    event.preventDefault();
    setMessage("");

    // Age validation
    if (!dateOfBirth) {
      setMessage(t("Please enter your date of birth."));
      return;
    }

    // Password validation
    if (password != confirmPassword) {
      setMessage(t("The confirm password isn't the same as the password entered."));
      return;
    }

    const today = new Date();
    const dob = new Date(dateOfBirth);
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const isUnder21 =
      age < 21 ||
      (age === 21 && (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())));

    if (isUnder21) {
      setMessage(t("You must be at least 21 years old to create an account."));
      return;
    }

    const result = await signUpUser(email, firstName, lastName, password, dateOfBirth);

    if (result.success) {
      setMessage(t("User account created!"));
      navigate("/confirm-email");
    }
    if (!result.success) {
      console.log(result);
      setMessage(result.error.message || t("An unexpected error occurred."));
    }
  };

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

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
                  {t("Account creation")}
                </MKTypography>
              </MKBox>
              {message && (
                <Alert sx={{ m: 2 }} severity="error" onClose={() => setMessage(null)}>
                  <AlertTitle>{t("Account creation error")}</AlertTitle>
                  {message}
                </Alert>
              )}
              <MKBox pt={4} pb={3} px={3}>
                <MKBox component="form" role="form" onSubmit={handleSignUpUser}>
                  <MKBox mb={2}>
                    <MKInput
                      type="email"
                      label={t("Email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="first name"
                      label={t("First name")}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      fullWidth
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="last name"
                      label={t("Last name")}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      fullWidth
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="password"
                      label={t("Password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="password"
                      label={t("confirm Password")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="date"
                      label={t("Date of Birth")}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </MKBox>
                  <MKBox mt={4} mb={1}>
                    <MKButton type="submit" variant="gradient" color="info" fullWidth>
                      {t("Create account")}
                    </MKButton>
                  </MKBox>
                  <MKBox mt={3} mb={1} textAlign="center">
                    <MKTypography variant="button" color="text">
                      {t("already have an account?")}{" "}
                      <MKTypography
                        component={Link}
                        to="/sign-in"
                        variant="button"
                        color="info"
                        fontWeight="medium"
                        textGradient
                      >
                        {t("Login")}
                      </MKTypography>
                    </MKTypography>
                  </MKBox>
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

export default Register;
