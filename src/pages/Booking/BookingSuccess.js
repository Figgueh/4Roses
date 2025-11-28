import { useLocation, useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    check_in,
    check_out,
    nights,
    total_price,
    amount_paid,
    payment_method,
    billing_name,
    billing_email,
    billing_address,
    billing_city,
    billing_postal,
    billing_country,
  } = state || {};

  const handleBackToHome = () => navigate("/");

  return (
    <MKBox
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={3}
      bgColor="#f5f5f5"
    >
      <MKBox width="100%" maxWidth="600px" p={4} borderRadius="2xl" bgColor="white" shadow="lg">
        <MKTypography variant="h3" fontWeight="bold" mb={3} textAlign="center">
          ✅ Booking Confirmed!
        </MKTypography>

        <MKTypography variant="body1" mb={2}>
          Thank you {billing_name || ""}, your booking is confirmed.
        </MKTypography>

        <Grid container spacing={1} mb={2}>
          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Check-in:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{check_in}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Check-out:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{check_out}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Nights:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{nights}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Total Price:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">€{total_price?.toFixed(2)}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Amount Paid:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">€{amount_paid?.toFixed(2)}</MKTypography>
          </Grid>

          <Grid item xs={6}>
            <MKTypography variant="body2" fontWeight="bold">
              Payment Method:
            </MKTypography>
          </Grid>
          <Grid item xs={6}>
            <MKTypography variant="body2">{payment_method}</MKTypography>
          </Grid>
        </Grid>

        {billing_address && (
          <MKBox mt={2} p={2} bgcolor="#f1f1f1" borderRadius="md">
            <MKTypography variant="body2" fontWeight="bold" mb={1}>
              Billing Address
            </MKTypography>
            <MKTypography variant="body2">{billing_name}</MKTypography>
            <MKTypography variant="body2">{billing_email}</MKTypography>
            <MKTypography variant="body2">{billing_address}</MKTypography>
            <MKTypography variant="body2">
              {billing_city}, {billing_postal}
            </MKTypography>
            <MKTypography variant="body2">{billing_country}</MKTypography>
          </MKBox>
        )}

        <MKButton fullWidth color="dark" sx={{ mt: 3 }} onClick={handleBackToHome}>
          Back to Home
        </MKButton>
      </MKBox>
    </MKBox>
  );
}
