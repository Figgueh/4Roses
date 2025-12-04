import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import { UserAuth } from "connection/auth/authContext";

export default function BookingsTab() {
  const { session } = UserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.id) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND}/reservation/user/${session.user.id}`
        );
        setBookings(data.bookings || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session]);

  if (loading) {
    return (
      <MKBox display="flex" justifyContent="center" alignItems="center" mt={4}>
        <CircularProgress />
      </MKBox>
    );
  }

  if (error) {
    return (
      <MKBox mt={4}>
        <MKTypography color="error" textAlign="center">
          {error}
        </MKTypography>
      </MKBox>
    );
  }

  if (bookings.length === 0) {
    return (
      <MKBox mt={4}>
        <MKTypography textAlign="center">You have no bookings yet.</MKTypography>
      </MKBox>
    );
  }

  return (
    <MKBox mt={2}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Check-In</TableCell>
              <TableCell>Check-Out</TableCell>
              <TableCell>Guests</TableCell>
              <TableCell>Total (€)</TableCell>
              <TableCell>Amount Paid (€)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.start_date}</TableCell>
                <TableCell>{booking.end_date}</TableCell>
                <TableCell>{booking.guests_under + booking.guests_over}</TableCell>
                <TableCell>{booking.total_price.toFixed(2)}</TableCell>
                <TableCell>{booking.amount_paid.toFixed(2)}</TableCell>
                <TableCell>{booking.status || "Pending"}</TableCell>
                <TableCell>
                  {/* Show Pay button ONLY if balance is due and not completed */}
                  {booking.amount_paid < booking.total_price && booking.status !== "completed" && (
                    <MKBox>
                      <MKTypography
                        component="button"
                        onClick={() => (window.location.href = `/continue-payment/${booking.id}`)}
                        sx={{
                          background: "#1976d2",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        Pay Balance (€{(booking.total_price - booking.amount_paid).toFixed(2)})
                      </MKTypography>
                    </MKBox>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MKBox>
  );
}
