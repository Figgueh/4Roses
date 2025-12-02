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
} from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

export default function ReservationManager() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [processingRefund, setProcessingRefund] = useState({});
  const [error, setError] = useState("");

  const statusOptions = ["pending", "confirmed", "cancelled"];

  // --------------------------
  // Load Reservations
  // --------------------------
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/reservation`);
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
  // Change Status
  // --------------------------
  const handleStatusChange = (id, newStatus) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  // --------------------------
  // Save Status
  // --------------------------
  const handleSave = async (id) => {
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) return;

    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND}/reservation/${id}`, {
        status: reservation.status,
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to update reservation.");
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

      {error && (
        <MKTypography color="error" mb={2}>
          {error}
        </MKTypography>
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
            {reservations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.billing_name || r.user_name}</TableCell>
                <TableCell>{r.start_date}</TableCell>
                <TableCell>{r.end_date}</TableCell>
                <TableCell>{r.number_of_guests}</TableCell>
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
                  {/* Save Status */}
                  <MKButton
                    variant="gradient"
                    color="info"
                    size="small"
                    onClick={() => handleSave(r.id)}
                    disabled={saving[r.id]}
                    sx={{ mr: 1 }}
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
                      sx={{ mr: 1 }}
                    >
                      {processingRefund[r.id] ? "Refunding..." : "Refund Deposit"}
                    </MKButton>
                  )}

                  {/* Download Invoice */}
                  <MKButton
                    variant="gradient"
                    color="dark"
                    size="small"
                    onClick={() => handleDownloadInvoice(r.id)}
                  >
                    Invoice
                  </MKButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MKBox>
  );
}
