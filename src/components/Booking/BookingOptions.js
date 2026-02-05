import PropTypes from "prop-types";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import MKInput from "components/MKInput";

export default function BookingOptions({ bookingData, setBookingData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  return (
    <Grid item xs={12}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Guest Information
          </Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <MKInput
                type="number"
                label="Guests aged 13 and over"
                name="guests_over"
                value={bookingData.guests_over}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MKInput
                type="number"
                label="Guests under 13 years old"
                name="guests_under"
                value={bookingData.guests_under}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}

BookingOptions.propTypes = {
  bookingData: PropTypes.shape({
    selectedDates: PropTypes.object,
    guests_over: PropTypes.number,
    guests_under: PropTypes.number,
  }).isRequired,
  setBookingData: PropTypes.func.isRequired,
};
