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
  Alert,
  AlertTitle,
} from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import { UserAuth } from "connection/auth/authContext";
import MKButton from "components/MKButton";

export default function BookingsTab() {
  const { session } = UserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
          `${process.env.REACT_APP_BACKEND}/bookings/user/${session.user.id}`
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

  const deleteBooking = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const { error } = await axios.delete(`${process.env.REACT_APP_BACKEND}/bookings/${id}`);

      if (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete booking. Please try again.");
        return;
      }

      setMessage("Booking deleted successfully.");
      // Refresh your list after delete
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Unexpected error deleting booking.");
    }
  };

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
      {message && (
        <Alert sx={{ mt: 2 }} severity="success" onClose={() => setMessage(null)}>
          <AlertTitle>My bookings status</AlertTitle>
          {message}
        </Alert>
      )}
      {error && (
        <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError(null)}>
          <AlertTitle>My bookings error</AlertTitle>
          {error}
        </Alert>
      )}
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
                  {/* Show Pay button ONLY if balance is due and not completed or pending */}
                  {booking.amount_paid < booking.total_price &&
                    booking.status !== "pending" &&
                    booking.status !== "completed" && (
                      <MKBox>
                        <MKButton
                          variant="gradient"
                          onClick={() => (window.location.href = `/continue-payment/${booking.id}`)}
                          color="success"
                        >
                          Pay Balance (€{(booking.total_price - booking.amount_paid).toFixed(2)})
                        </MKButton>
                      </MKBox>
                    )}
                  {booking.status === "pending" && (
                    <MKButton
                      variant="gradient"
                      color="error"
                      onClick={() => deleteBooking(booking.id)}
                    >
                      Delete
                    </MKButton>
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
