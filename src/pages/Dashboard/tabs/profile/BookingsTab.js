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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BookingsTab() {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.id) {
        setError(t("User not logged in"));
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

  const handleDownloadInvoice = async (id) => {
    try {
      setDownloadingId(id);

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND}/billings/${id}/invoice?lang=${i18n.language}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(t("Failed to download invoice."));
    } finally {
      setDownloadingId(null);
    }
  };

  const cancelBooking = async (id) => {
    const confirmed = window.confirm(
      t("Are you sure you want to cancel this booking? This action cannot be undone.")
    );
    if (!confirmed) return;

    const reservation = bookings.find((res) => res.id === id);

    try {
      const { error } = await axios.put(`${process.env.REACT_APP_BACKEND}/bookings/${id}`, {
        status: "cancelled",
        start_date: reservation.start_date,
        end_date: reservation.end_date,
      });

      if (error) {
        console.error(t("cancelled Booking failed:"), error);
        alert(t("Failed to cancel booking. Please try again."));
        return;
      }

      setMessage(t("Booking cancelled successfully."));
      // Refresh your list after cancel
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert(t("Unexpected error canceling booking."));
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
        <MKTypography textAlign="center">{t("You have no bookings yet.")}</MKTypography>
      </MKBox>
    );
  }

  return (
    <MKBox mt={2}>
      {message && (
        <Alert sx={{ mt: 2, mb: 2 }} severity="success" onClose={() => setMessage(null)}>
          <AlertTitle>{t("My bookings status")}</AlertTitle>
          {message}
        </Alert>
      )}
      {error && (
        <Alert sx={{ mt: 2, mb: 2 }} severity="error" onClose={() => setError(null)}>
          <AlertTitle>{t("My bookings error")}</AlertTitle>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell>{t("Booking ID")}</TableCell>
              <TableCell>{t("Check-In")}</TableCell>
              <TableCell>{t("Check-Out")}</TableCell>
              <TableCell>{t("Guests")}</TableCell>
              <TableCell>{t("Total")} (€)</TableCell>
              <TableCell>{t("Amount Paid")} (€)</TableCell>
              <TableCell>{t("Status")}</TableCell>
              <TableCell align="center">{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell sx={{ maxWidth: 200 }}>{booking.id}</TableCell>
                <TableCell>{booking.start_date}</TableCell>
                <TableCell>{booking.end_date}</TableCell>
                <TableCell>{booking.guests_under + booking.guests_over}</TableCell>
                <TableCell>{booking.total_price.toFixed(2)}</TableCell>
                <TableCell>{booking.amount_paid.toFixed(2)}</TableCell>
                <TableCell>{t(booking.status) || t("Pending")}</TableCell>
                <TableCell align="center">
                  {/* Show Pay button ONLY if balance is due and confirmed that the first payment was made. */}
                  {booking.amount_paid < booking.total_price && booking.status === "confirmed" && (
                    <MKBox>
                      <MKButton
                        variant="gradient"
                        onClick={() => (window.location.href = `/continue-payment/${booking.id}`)}
                        color="success"
                      >
                        {t("Pay Balance")} (€
                        {(booking.total_price - booking.amount_paid).toFixed(2)})
                      </MKButton>
                    </MKBox>
                  )}
                  {booking.status === "pending" && (
                    <MKBox display="flex" gap={1} flexWrap="wrap">
                      <MKButton
                        variant="gradient"
                        color="success"
                        onClick={() => navigate(`/continue-payment/${booking.id}`)}
                      >
                        {t("View IBAN information")}
                      </MKButton>
                      <MKButton
                        variant="gradient"
                        color="error"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        {t("Cancel")}
                      </MKButton>
                    </MKBox>
                  )}
                  {booking.status === "completed" && (
                    <MKBox>
                      <MKButton
                        variant="gradient"
                        onClick={() => handleDownloadInvoice(booking.id)}
                        color="success"
                        disabled={downloadingId === booking.id}
                      >
                        {downloadingId === booking.id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          t("Download invoice")
                        )}
                      </MKButton>
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
