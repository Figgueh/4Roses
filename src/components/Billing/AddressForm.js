import PropTypes from "prop-types";
import { Grid, MenuItem, TextField } from "@mui/material";
import MKInput from "components/MKInput";
import { useTranslation } from "react-i18next";

const COUNTRIES = [
  { code: "AF", en: "Afghanistan" },
  { code: "AL", en: "Albania" },
  { code: "DZ", en: "Algeria" },
  { code: "AD", en: "Andorra" },
  { code: "AO", en: "Angola" },
  { code: "AG", en: "Antigua and Barbuda" },
  { code: "AR", en: "Argentina" },
  { code: "AM", en: "Armenia" },
  { code: "AU", en: "Australia" },
  { code: "AT", en: "Austria" },
  { code: "AZ", en: "Azerbaijan" },
  { code: "BS", en: "Bahamas" },
  { code: "BH", en: "Bahrain" },
  { code: "BD", en: "Bangladesh" },
  { code: "BB", en: "Barbados" },
  { code: "BY", en: "Belarus" },
  { code: "BE", en: "Belgium" },
  { code: "BZ", en: "Belize" },
  { code: "BJ", en: "Benin" },
  { code: "BT", en: "Bhutan" },
  { code: "BO", en: "Bolivia" },
  { code: "BA", en: "Bosnia and Herzegovina" },
  { code: "BW", en: "Botswana" },
  { code: "BR", en: "Brazil" },
  { code: "BN", en: "Brunei" },
  { code: "BG", en: "Bulgaria" },
  { code: "BF", en: "Burkina Faso" },
  { code: "BI", en: "Burundi" },
  { code: "CV", en: "Cabo Verde" },
  { code: "KH", en: "Cambodia" },
  { code: "CM", en: "Cameroon" },
  { code: "CA", en: "Canada" },
  { code: "CF", en: "Central African Republic" },
  { code: "TD", en: "Chad" },
  { code: "CL", en: "Chile" },
  { code: "CN", en: "China" },
  { code: "CO", en: "Colombia" },
  { code: "KM", en: "Comoros" },
  { code: "CG", en: "Congo" },
  { code: "CR", en: "Costa Rica" },
  { code: "HR", en: "Croatia" },
  { code: "CU", en: "Cuba" },
  { code: "CY", en: "Cyprus" },
  { code: "CZ", en: "Czech Republic" },
  { code: "DK", en: "Denmark" },
  { code: "DJ", en: "Djibouti" },
  { code: "DM", en: "Dominica" },
  { code: "DO", en: "Dominican Republic" },
  { code: "EC", en: "Ecuador" },
  { code: "EG", en: "Egypt" },
  { code: "SV", en: "El Salvador" },
  { code: "GQ", en: "Equatorial Guinea" },
  { code: "ER", en: "Eritrea" },
  { code: "EE", en: "Estonia" },
  { code: "SZ", en: "Eswatini" },
  { code: "ET", en: "Ethiopia" },
  { code: "FJ", en: "Fiji" },
  { code: "FI", en: "Finland" },
  { code: "FR", en: "France" },
  { code: "GA", en: "Gabon" },
  { code: "GM", en: "Gambia" },
  { code: "GE", en: "Georgia" },
  { code: "DE", en: "Germany" },
  { code: "GH", en: "Ghana" },
  { code: "GR", en: "Greece" },
  { code: "GD", en: "Grenada" },
  { code: "GT", en: "Guatemala" },
  { code: "GN", en: "Guinea" },
  { code: "GW", en: "Guinea-Bissau" },
  { code: "GY", en: "Guyana" },
  { code: "HT", en: "Haiti" },
  { code: "HN", en: "Honduras" },
  { code: "HU", en: "Hungary" },
  { code: "IS", en: "Iceland" },
  { code: "IN", en: "India" },
  { code: "ID", en: "Indonesia" },
  { code: "IR", en: "Iran" },
  { code: "IQ", en: "Iraq" },
  { code: "IE", en: "Ireland" },
  { code: "IL", en: "Israel" },
  { code: "IT", en: "Italy" },
  { code: "JM", en: "Jamaica" },
  { code: "JP", en: "Japan" },
  { code: "JO", en: "Jordan" },
  { code: "KZ", en: "Kazakhstan" },
  { code: "KE", en: "Kenya" },
  { code: "KI", en: "Kiribati" },
  { code: "KW", en: "Kuwait" },
  { code: "KG", en: "Kyrgyzstan" },
  { code: "LA", en: "Laos" },
  { code: "LV", en: "Latvia" },
  { code: "LB", en: "Lebanon" },
  { code: "LS", en: "Lesotho" },
  { code: "LR", en: "Liberia" },
  { code: "LY", en: "Libya" },
  { code: "LI", en: "Liechtenstein" },
  { code: "LT", en: "Lithuania" },
  { code: "LU", en: "Luxembourg" },
  { code: "MG", en: "Madagascar" },
  { code: "MW", en: "Malawi" },
  { code: "MY", en: "Malaysia" },
  { code: "MV", en: "Maldives" },
  { code: "ML", en: "Mali" },
  { code: "MT", en: "Malta" },
  { code: "MH", en: "Marshall Islands" },
  { code: "MR", en: "Mauritania" },
  { code: "MU", en: "Mauritius" },
  { code: "MX", en: "Mexico" },
  { code: "FM", en: "Micronesia" },
  { code: "MD", en: "Moldova" },
  { code: "MC", en: "Monaco" },
  { code: "MN", en: "Mongolia" },
  { code: "ME", en: "Montenegro" },
  { code: "MA", en: "Morocco" },
  { code: "MZ", en: "Mozambique" },
  { code: "MM", en: "Myanmar" },
  { code: "NA", en: "Namibia" },
  { code: "NR", en: "Nauru" },
  { code: "NP", en: "Nepal" },
  { code: "NL", en: "Netherlands" },
  { code: "NZ", en: "New Zealand" },
  { code: "NI", en: "Nicaragua" },
  { code: "NE", en: "Niger" },
  { code: "NG", en: "Nigeria" },
  { code: "KP", en: "North Korea" },
  { code: "MK", en: "North Macedonia" },
  { code: "NO", en: "Norway" },
  { code: "OM", en: "Oman" },
  { code: "PK", en: "Pakistan" },
  { code: "PW", en: "Palau" },
  { code: "PS", en: "Palestine" },
  { code: "PA", en: "Panama" },
  { code: "PG", en: "Papua New Guinea" },
  { code: "PY", en: "Paraguay" },
  { code: "PE", en: "Peru" },
  { code: "PH", en: "Philippines" },
  { code: "PL", en: "Poland" },
  { code: "PT", en: "Portugal" },
  { code: "QA", en: "Qatar" },
  { code: "RO", en: "Romania" },
  { code: "RU", en: "Russia" },
  { code: "RW", en: "Rwanda" },
  { code: "KN", en: "Saint Kitts and Nevis" },
  { code: "LC", en: "Saint Lucia" },
  { code: "VC", en: "Saint Vincent and the Grenadines" },
  { code: "WS", en: "Samoa" },
  { code: "SM", en: "San Marino" },
  { code: "ST", en: "Sao Tome and Principe" },
  { code: "SA", en: "Saudi Arabia" },
  { code: "SN", en: "Senegal" },
  { code: "RS", en: "Serbia" },
  { code: "SC", en: "Seychelles" },
  { code: "SL", en: "Sierra Leone" },
  { code: "SG", en: "Singapore" },
  { code: "SK", en: "Slovakia" },
  { code: "SI", en: "Slovenia" },
  { code: "SB", en: "Solomon Islands" },
  { code: "SO", en: "Somalia" },
  { code: "ZA", en: "South Africa" },
  { code: "KR", en: "South Korea" },
  { code: "SS", en: "South Sudan" },
  { code: "ES", en: "Spain" },
  { code: "LK", en: "Sri Lanka" },
  { code: "SD", en: "Sudan" },
  { code: "SR", en: "Suriname" },
  { code: "SE", en: "Sweden" },
  { code: "CH", en: "Switzerland" },
  { code: "SY", en: "Syria" },
  { code: "TW", en: "Taiwan" },
  { code: "TJ", en: "Tajikistan" },
  { code: "TZ", en: "Tanzania" },
  { code: "TH", en: "Thailand" },
  { code: "TL", en: "Timor-Leste" },
  { code: "TG", en: "Togo" },
  { code: "TO", en: "Tonga" },
  { code: "TT", en: "Trinidad and Tobago" },
  { code: "TN", en: "Tunisia" },
  { code: "TR", en: "Turkey" },
  { code: "TM", en: "Turkmenistan" },
  { code: "TV", en: "Tuvalu" },
  { code: "UG", en: "Uganda" },
  { code: "UA", en: "Ukraine" },
  { code: "AE", en: "United Arab Emirates" },
  { code: "GB", en: "United Kingdom" },
  { code: "US", en: "United States" },
  { code: "UY", en: "Uruguay" },
  { code: "UZ", en: "Uzbekistan" },
  { code: "VU", en: "Vanuatu" },
  { code: "VA", en: "Vatican City" },
  { code: "VE", en: "Venezuela" },
  { code: "VN", en: "Vietnam" },
  { code: "YE", en: "Yemen" },
  { code: "ZM", en: "Zambia" },
  { code: "ZW", en: "Zimbabwe" },
];

export default function AddressForm({ form, handleChange }) {
  const { i18n, t } = useTranslation();

  const regionNames = new Intl.DisplayNames([i18n.language], { type: "region" });

  const translatedCountries = COUNTRIES.map((c) => ({
    code: c.code,
    name: regionNames.of(c.code) ?? c.en,
  })).sort((a, b) => a.name.localeCompare(b.name));

  // Match on ISO code now instead of English name
  const countryCode = form.billing_country?.toUpperCase() || "";

  const stateLabel =
    countryCode === "CA"
      ? t("Province")
      : countryCode === "PT"
      ? t("District")
      : countryCode === "US"
      ? t("State")
      : `${t("Province")} / ${t("State")}`;

  const cityLabel = countryCode === "PT" ? t("Municipality") : t("City");

  const postalCodeLabel = countryCode === "US" ? t("Zip Code") : t("Postal Code");

  return (
    <>
      <Grid item xs={12}>
        <MKInput
          label={t("Full Name")}
          name="billing_name"
          value={form.billing_name}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>

      <Grid item xs={12}>
        <MKInput
          label={t("Phone number")}
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>

      <Grid item xs={12}>
        <MKInput
          label={t("Street Address")}
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
          label={t("Country")}
          name="billing_country"
          value={form.billing_country}
          onChange={handleChange}
          fullWidth
          required
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": { height: "45px" },
            "& .MuiInputLabel-root": { lineHeight: "1" },
          }}
        >
          {translatedCountries.map((c) => (
            <MenuItem key={c.code} value={c.code}>
              {c.name}
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
