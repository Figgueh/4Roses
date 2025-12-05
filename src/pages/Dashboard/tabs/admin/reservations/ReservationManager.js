import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
} from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

export default function ReservationManager() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [processingRefund, setProcessingRefund] = useState({});
  const [backupReservations, setBackupReservations] = useState([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [filterId, setFilterId] = useState(""); // <-- Booking ID filter state

  const statusOptions = ["pending", "confirmed", "completed", "cancelled"];

  // --------------------------
  // Load Reservations
  // --------------------------
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/bookings`);
        setReservations(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reservations.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  // --------------------------
  // Change Status (locally)
  // --------------------------
  const handleStatusChange = (id, newStatus) => {
    setBackupReservations(reservations);
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  // --------------------------
  // Save Status (backend)
  // --------------------------
  const handleSave = async (id) => {
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) return;

    setSaving((prev) => ({ ...prev, [id]: true }));

    try {
      await axios.put(`${process.env.REACT_APP_BACKEND}/bookings/${id}`, {
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        status: reservation.status,
      });

      setError("");
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setError("There already exists a reservation booked on this date.");
      } else {
        setError("Failed to update reservation.");
      }

      setReservations(backupReservations);
      return;
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  // --------------------------
  // Refund Deposit
  // --------------------------
  const handleRefundDeposit = async (id) => {
    setProcessingRefund((p) => ({ ...p, [id]: true }));
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}/reservation/${id}/refund-security`);

      // Update local UI
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, security_refunded: true } : r))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to refund security deposit.");
    } finally {
      setProcessingRefund((p) => ({ ...p, [id]: false }));
    }
  };

  // --------------------------
  // Download Invoice
  // --------------------------
  const handleDownloadInvoice = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND}/reservation/${id}/invoice`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Failed to download invoice.");
    }
  };

  // --------------------------
  // Delete reservation
  // --------------------------
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const { data } = await axios.delete(`${process.env.REACT_APP_BACKEND}/bookings/${id}`);

      if (data.error) {
        setError("Delete failed: " + data.error);
        return;
      }

      setMessage("Booking deleted successfully.");
      setReservations((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      setError("Unexpected error deleting booking.");
    }
  };

  // --------------------------
  // Filtered Reservations
  // --------------------------
  const filteredReservations = reservations.filter((r) =>
    r.id.toLowerCase().includes(filterId.toLowerCase())
  );

  // --------------------------
  // Loading Spinner
  // --------------------------
  if (loading) {
    return (
      <MKBox display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </MKBox>
    );
  }

  // --------------------------
  // Render Table
  // --------------------------
  return (
    <MKBox p={4}>
      <MKTypography variant="h4" fontWeight="bold" mb={3}>
        Reservation Manager
      </MKTypography>

      {/* Filter by Booking ID */}
      <TextField
        label="Filter by Booking ID"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 3 }}
        value={filterId}
        onChange={(e) => setFilterId(e.target.value)}
      />

      {error && (
        <Alert sx={{ mt: 2, mb: 2 }} severity="error" onClose={() => setError(null)}>
          <AlertTitle>Reservation Manager Error</AlertTitle>
          {error}
        </Alert>
      )}
      {message && (
        <Alert sx={{ mt: 2, mb: 2 }} severity="success" onClose={() => setMessage(null)}>
          <AlertTitle>Reservation Manager Status</AlertTitle>
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell>Guest Name</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Guests</TableCell>
              <TableCell>Total (€)</TableCell>
              <TableCell>Paid (€)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredReservations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.billing_name || r.user_name}</TableCell>
                <TableCell>{r.start_date}</TableCell>
                <TableCell>{r.end_date}</TableCell>
                <TableCell>{r.guests_under + r.guests_over}</TableCell>
                <TableCell>{r.total_price?.toFixed(2)}</TableCell>
                <TableCell>{r.amount_paid?.toFixed(2)}</TableCell>

                <TableCell>
                  <Select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    size="small"
                  >
                    {statusOptions.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>

                <TableCell align="right">
                  <MKBox display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
                    {/* Save Status */}
                    <MKButton
                      variant="gradient"
                      color="success"
                      size="small"
                      onClick={() => handleSave(r.id)}
                      disabled={saving[r.id]}
                    >
                      {saving[r.id] ? "Saving..." : "Save"}
                    </MKButton>

                    {/* Refund Security Deposit */}
                    {!r.security_refunded && r.security_deposit > 0 && (
                      <MKButton
                        variant="gradient"
                        color="warning"
                        size="small"
                        onClick={() => handleRefundDeposit(r.id)}
                        disabled={processingRefund[r.id]}
                      >
                        {processingRefund[r.id] ? "Refunding..." : "Refund Deposit"}
                      </MKButton>
                    )}

                    {/* Delete reservation */}
                    {r.status === "pending" && (
                      <MKButton
                        variant="gradient"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </MKButton>
                    )}

                    {/* Download Invoice */}
                    <MKButton
                      variant="gradient"
                      color="info"
                      size="small"
                      onClick={() => handleDownloadInvoice(r.id)}
                    >
                      Invoice
                    </MKButton>
                  </MKBox>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MKBox>
  );
}
