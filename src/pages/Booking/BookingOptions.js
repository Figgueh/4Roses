import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import MKInput from "components/MKInput";

export default function BookingOptions({ bookingData, setBookingData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) || 1 : value,
    }));
  };
  return (
    <>
      <Grid item xs={12}>
        <MKInput
          type="number"
          label="Number of guests"
          name="guests"
          value={bookingData.guests}
          onChange={handleChange}
          inputProps={{ min: 1 }}
          fullWidth
          required
        />
      </Grid>
    </>
  );
}

BookingOptions.propTypes = {
  bookingData: PropTypes.shape({
    selectedDates: PropTypes.object,
    guests: PropTypes.number,
  }).isRequired,
  setBookingData: PropTypes.func.isRequired,
};
