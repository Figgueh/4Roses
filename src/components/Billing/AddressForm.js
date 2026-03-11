import PropTypes from "prop-types";
import { Grid, MenuItem, TextField } from "@mui/material";
import MKInput from "components/MKInput";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export default function AddressForm({ form, handleChange }) {
  const country = form.billing_country?.toLowerCase() || "";

  const stateLabel =
    country === "canada"
      ? "Province"
      : country === "portugal"
      ? "District"
      : country === "united states"
      ? "State"
      : "Province / State";

  const cityLabel = country === "portugal" ? "Municipality" : "City";

  const postalCodeLabel = country === "united states" ? "Zip Code" : "Postal Code";

  return (
    <>
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

      {/* Country dropdown */}
      <Grid item xs={12}>
        <TextField
          select
          label="Country"
          name="billing_country"
          value={form.billing_country}
          onChange={handleChange}
          fullWidth
          required
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "45px", // adjust this to match your MKInput height
            },
            "& .MuiInputLabel-root": {
              lineHeight: "1",
            },
          }}
        >
          {COUNTRIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

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
          value={form.billing_state}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>

      <Grid item xs={12}>
        <MKInput
          label={postalCodeLabel}
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
    billing_state: PropTypes.string.isRequired,
    billing_city: PropTypes.string.isRequired,
    billing_postal_code: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};
