// components/BankTransferSection.jsx
import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
import AddressForm from "./AddressForm";

export default function Iban({ form, handleChange, booking, loading, handleSubmit }) {
  return (
    <>
      <AddressForm form={form} handleChange={handleChange} />

      <Grid item xs={12}>
        <MKBox p={2} bgcolor="#f1f1f1" borderRadius="md">
          <MKTypography variant="body2">
            Transfer the deposit in <strong>euros (€)</strong> to:
          </MKTypography>

          <MKTypography fontWeight="bold" mt={1}>
            {process.env.REACT_APP_RENTAL_IBAN}
          </MKTypography>

          <MKTypography variant="body2" mt={2}>
            <strong>Recipient details:</strong>
          </MKTypography>

          <MKTypography fontWeight="bold">Joaquim Figueiras</MKTypography>
          <MKTypography>Email: joefigueiras@gmail.com</MKTypography>
          <MKTypography>Phone: +351 969 755 150</MKTypography>

          <MKTypography variant="body2" mt={2}>
            <strong>Address:</strong>
          </MKTypography>
          <MKTypography>Portugal</MKTypography>
          <MKTypography>R. Julio Amaro 33</MKTypography>
          <MKTypography>Montes-de-Alvor</MKTypography>
          <MKTypography>8500-084</MKTypography>

          <MKTypography variant="body2" mt={2}>
            <strong>Reason:</strong> {booking}
          </MKTypography>

          <MKTypography variant="body2" color="secondary" mt={2}>
            You will receive a confirmation email once payment is received.
          </MKTypography>
          <MKTypography variant="body2" color="secondary">
            Please allow up to 24 hours for confirmation.
          </MKTypography>
        </MKBox>

        <MKButton onClick={handleSubmit} fullWidth color="dark" disabled={loading}>
          {loading ? "Processing..." : "Create reservation"}
        </MKButton>
      </Grid>
    </>
  );
}

Iban.propTypes = {
  form: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  booking: PropTypes.shape({
    id: PropTypes.string,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};
