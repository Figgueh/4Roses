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
  const [backupReservations, setBackupReservations] = useState([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [filterId, setFilterId] = useState(""); // <-- Booking ID filter state

  const statusOptions = ["pending", "confirmed", "paid", "completed", "cancelled"];

  // --------------------------
  // Load Reservations
  // --------------------------
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/bookings`);
        setReservations(data);
        setBackupReservations(data);
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
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  // --------------------------
  // Save Status (backend)
  // --------------------------
  const handleSave = async (id, status) => {
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) return;

    setSaving((prev) => ({ ...prev, [id]: true }));

    try {
      const { data } = await axios.put(`${process.env.REACT_APP_BACKEND}/bookings/${id}`, {
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        paid: reservation.total_price,
        ...(status ? { status: status } : { status: reservation.status }),
      });

      const updated = data.updated;

      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setBackupReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));

      // Send email
      if (status === "confirmed" || status === "paid") {
        await axios.post(`${process.env.REACT_APP_BACKEND}/email/confirmedBooking`, {
          reservation_id: reservation.id,
        });
      }

      setError("");
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setError("There already exists a reservation booked on this date.");
      } else {
        setError("Failed to update reservation.");
      }

      setReservations(backupReservations);
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  // --------------------------
  // Download Invoice
  // --------------------------
  const handleDownloadInvoice = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND}/billings/${id}/invoice`, {
        responseType: "blob",
      });

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
  // Settle Security Deposit
  // --------------------------
  const handleSecurityDeposit = async (id) => {
    const input = window.prompt("Enter the amount reimbursed to the customer (€):");

    if (input === null) return; // user pressed Cancel

    const amount = Number(input);

    if (isNaN(amount) || amount < 0) {
      setError("Invalid amount entered.");
      return;
    }

    if (amount > 500) {
      setError("500€ is the maximum amount that can be refunded.");
    }

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND}/bookings/${id}/settleSecurityDeposit`,
        { amount }
      );

      if (data.error) {
        setError(data.error);
        return;
      }

      setReservations((prev) => prev.map((r) => (r.id === id ? data.reservation : r)));
      setBackupReservations((prev) => prev.map((r) => (r.id === id ? data.reservation : r)));

      // Send email
      await axios.post(`${process.env.REACT_APP_BACKEND}/email/securityDepositSettled`, {
        reservation_id: id,
      });

      setMessage(`Security deposit settled. Reimbursed €${amount.toFixed(2)}.`);
    } catch (err) {
      setError("Failed to settle security deposit.");
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
              <TableCell>Payment method</TableCell>
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
                <TableCell>{r.payment_method}</TableCell>

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
                    {r.status !== backupReservations.find((b) => b.id === r.id)?.status && (
                      <MKButton
                        variant="gradient"
                        color="success"
                        size="small"
                        onClick={() => handleSave(r.id)}
                        disabled={saving[r.id]}
                      >
                        {saving[r.id] ? "Saving..." : "Save"}
                      </MKButton>
                    )}

                    {/* confirm Iban deposit */}
                    {(r.status === "pending" || r.status === "confirmed") &&
                      r.payment_method === "iban" && (
                        <MKButton
                          variant="gradient"
                          color="success"
                          size="small"
                          onClick={() =>
                            handleSave(r.id, r.status === "pending" ? "confirmed" : "paid")
                          }
                          disabled={saving[r.id]}
                        >
                          confirm payment
                        </MKButton>
                      )}

                    {/* Delete reservation */}
                    {(r.status === "pending" || r.status === "cancelled") && (
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
                    {r.status === "completed" && (
                      <MKButton
                        variant="gradient"
                        color="info"
                        size="small"
                        onClick={() => handleDownloadInvoice(r.id)}
                      >
                        Invoice
                      </MKButton>
                    )}

                    {/* Settle security deposit */}
                    {r.status === "paid" && (
                      <MKButton
                        variant="gradient"
                        color="info"
                        size="small"
                        onClick={() => handleSecurityDeposit(r.id)}
                      >
                        Settle security deposit
                      </MKButton>
                    )}
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
