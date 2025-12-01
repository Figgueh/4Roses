import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import MKInput from "components/MKInput";

export default function AddressForm({ form, handleChange }) {
  const country = form.billing_country?.toLowerCase() || "";

  // Determine province/state label based on country
  // Province/State/District label
  const stateLabel =
    country === "canada"
      ? "Province"
      : country === "portugal"
      ? "District"
      : country === "usa"
      ? "State"
      : "Province / State";

  // City / Municipality label
  const cityLabel = country === "portugal" ? "Municipality" : "City";

  return (
    <>
      {/* Billing Name */}
      <Grid item xs={12}>
        <MKInput
          label="Full Name"
          name="billing_name"
          value={form.billing_name}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>

      {/* Phone */}
      <Grid item xs={12}>
        <MKInput
          label="Phone number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>

      {/* Street Address */}
      <Grid item xs={12}>
        <MKInput
          label="Street Address"
          name="billing_address"
          value={form.billing_address}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>

      {/* Country */}
      <Grid item xs={12}>
        <MKInput
          label="Country"
          name="billing_country"
          value={form.billing_country}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>

      {/* Province/State + City */}
      <Grid item xs={6}>
        <MKInput
          label={cityLabel}
          name="billing_city"
          value={form.billing_city}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={6}>
        <MKInput
          label={stateLabel}
          name="billing_state"
          value={form.billing_State}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>

      {/* Postal Code */}
      <Grid item xs={12}>
        <MKInput
          label="Postal Code"
          name="billing_postal_code"
          value={form.billing_postal_code}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>
    </>
  );
}

AddressForm.propTypes = {
  form: PropTypes.shape({
    billing_name: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    billing_address: PropTypes.string.isRequired,
    billing_country: PropTypes.string.isRequired,
    billing_State: PropTypes.string.isRequired,
    billing_city: PropTypes.string.isRequired,
    billing_postal_code: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};
