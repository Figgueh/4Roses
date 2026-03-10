import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import {
  SaveOutlined,
  DeleteOutlineOutlined,
  ReceiptLongOutlined,
  AccountBalanceOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ArrowRightAltOutlined,
} from "@mui/icons-material";

const serif = "'Cormorant Garamond', serif";
const brown = "#8b4513";
const brownLight = "#7a3c10";
const border = "1px solid #ede5db";
const bg = "#fdf8f3";

const STATUS_CONFIG = {
  pending: { color: "#b8860b", bg: "#fffbe6", border: "#e8d89a", label: "Pending" },
  confirmed: { color: "#1a6b3c", bg: "#f0faf3", border: "#a8dbb9", label: "Confirmed" },
  paid: { color: "#1565c0", bg: "#e8f0fe", border: "#90b4f5", label: "Paid" },
  completed: { color: "#4a4a4a", bg: "#f5f5f5", border: "#cccccc", label: "Completed" },
  cancelled: { color: "#c0392b", bg: "#fef0ee", border: "#f5b7b1", label: "Cancelled" },
};

// Maps which action keys are visible per status
const ACTION_FILTERS = [
  { key: "confirm", label: "Needs confirmation" },
  { key: "deposit", label: "Needs deposit settlement" },
  { key: "invoice", label: "Has invoice" },
  { key: "save", label: "Unsaved changes" },
  { key: "delete", label: "Deletable" },
];

const statusOptions = ["pending", "confirmed", "paid", "completed", "cancelled"];

const DATA_COLS = [
  { label: "Guest", width: 200 },
  { label: "Dates", width: 200 },
  { label: "Guests", width: 75 },
  { label: "Total", width: 95 },
  { label: "Paid", width: 95 },
  { label: "Method", width: 110 },
  { label: "Reservation id", width: 150 },
  { label: "Status", width: 150 },
];

const ACTIONS_WIDTH = 250;

export default function ReservationManager() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [backupReservations, setBackupReservations] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filterId, setFilterId] = useState("");
  const [actionFilter, setActionFilter] = useState(null); // null = all
  const [invoicing, setInvoicing] = useState({});

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/bookings`);
        setReservations(data);
        setBackupReservations(data);
      } catch {
        setError("Failed to load reservations.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const handleSave = async (id, status) => {
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const { data } = await axios.put(`${process.env.REACT_APP_BACKEND}/bookings/${id}`, {
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        paid: reservation.total_price,
        ...(status ? { status } : { status: reservation.status }),
      });
      const updated = data.updated;
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setBackupReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (status === "confirmed" || status === "paid") {
        await axios.post(`${process.env.REACT_APP_BACKEND}/email/confirmedBooking`, {
          reservation_id: reservation.id,
        });
      }
      setError("");
      setMessage("Reservation updated successfully.");
    } catch (err) {
      if (err.response?.status === 409) {
        setError("There already exists a reservation booked on this date.");
      } else {
        setError("Failed to update reservation.");
      }
      setReservations(backupReservations);
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDownloadInvoice = async (id) => {
    setInvoicing((prev) => ({ ...prev, [id]: true }));
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
    } catch {
      setError("Failed to download invoice.");
    } finally {
      setInvoicing((prev) => ({ ...prev, [id]: false }));
    }
  };

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
    } catch {
      setError("Unexpected error deleting booking.");
    }
  };

  const handleSecurityDeposit = async (id) => {
    const input = window.prompt("Enter the amount reimbursed to the customer (€):");
    if (input === null) return;
    const amount = Number(input);
    if (isNaN(amount) || amount < 0) {
      setError("Invalid amount entered.");
      return;
    }
    if (amount > 500) {
      setError("500€ is the maximum amount that can be refunded.");
      return;
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
      await axios.post(`${process.env.REACT_APP_BACKEND}/email/securityDepositSettled`, {
        reservation_id: id,
      });
      setMessage(`Security deposit settled. Reimbursed €${amount.toFixed(2)}.`);
    } catch {
      setError("Failed to settle security deposit.");
    }
  };

  // Derive which action keys apply to a reservation
  const getActionKeys = (r, backup) => {
    const keys = [];
    if (r.status !== backup?.status) keys.push("save");
    if ((r.status === "pending" || r.status === "confirmed") && r.payment_method === "iban")
      keys.push("confirm");
    if (r.status === "paid") keys.push("deposit");
    if (r.status === "completed") keys.push("invoice");
    if (r.status === "pending" || r.status === "cancelled") keys.push("delete");
    return keys;
  };

  const filtered = reservations.filter((r) => {
    const backup = backupReservations.find((b) => b.id === r.id);
    const textMatch =
      r.id.toLowerCase().includes(filterId.toLowerCase()) ||
      (r.billing_name || r.user_name || "").toLowerCase().includes(filterId.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(filterId.toLowerCase());
    const actionMatch = !actionFilter || getActionKeys(r, backup).includes(actionFilter);
    return textMatch && actionMatch;
  });

  // Count per action filter for badge numbers
  const actionCounts = ACTION_FILTERS.reduce((acc, f) => {
    acc[f.key] = reservations.filter((r) => {
      const backup = backupReservations.find((b) => b.id === r.id);
      return getActionKeys(r, backup).includes(f.key);
    }).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <MKBox display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: brown }} />
      </MKBox>
    );
  }

  return (
    <MKBox p={{ xs: 2, md: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: serif, fontWeight: 600, color: "#1e1612", mb: 0.5 }}
        >
          Reservation Manager
        </Typography>
        <Typography variant="body2" sx={{ color: "#9e8a80" }}>
          {reservations.length} reservation{reservations.length !== 1 ? "s" : ""} total
        </Typography>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by ID, guest name, or email…"
        variant="outlined"
        size="small"
        fullWidth
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            background: "#fff",
            "&.Mui-focused fieldset": { borderColor: brown },
          },
        }}
        value={filterId}
        onChange={(e) => setFilterId(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined sx={{ color: "#9e8a80", fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Action filter chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        <Chip
          label="All"
          size="small"
          onClick={() => setActionFilter(null)}
          sx={{
            fontSize: "11px",
            fontWeight: actionFilter === null ? 600 : 400,
            background: actionFilter === null ? brown : "#fff",
            color: actionFilter === null ? "#fff" : "#9e8a80",
            border: actionFilter === null ? `1px solid ${brown}` : border,
            cursor: "pointer",
          }}
        />
        {ACTION_FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={`${f.label}${actionCounts[f.key] ? ` (${actionCounts[f.key]})` : ""}`}
            size="small"
            onClick={() => setActionFilter(actionFilter === f.key ? null : f.key)}
            sx={{
              fontSize: "11px",
              fontWeight: actionFilter === f.key ? 600 : 400,
              background: actionFilter === f.key ? brown : "#fff",
              color: actionFilter === f.key ? "#fff" : "#9e8a80",
              border: actionFilter === f.key ? `1px solid ${brown}` : border,
              cursor: "pointer",
            }}
          />
        ))}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, borderRadius: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" onClose={() => setMessage("")} sx={{ mb: 2, borderRadius: 2 }}>
          <AlertTitle>Success</AlertTitle>
          {message}
        </Alert>
      )}

      {/* Table */}
      <Box
        sx={{
          border,
          borderRadius: 3,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(139,69,19,0.06)",
          position: "relative",
        }}
      >
        {/* Scrollable area for data columns only */}
        <Box sx={{ display: "flex" }}>
          {/* Left: scrollable data columns */}
          <Box
            sx={{
              overflowX: "auto",
              flex: 1,
              minWidth: 0,
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-track": { background: "#fdf8f3" },
              "&::-webkit-scrollbar-thumb": { background: "#e8c4a8", borderRadius: 3 },
            }}
          >
            <Box sx={{ minWidth: DATA_COLS.reduce((a, c) => a + c.width, 0) }}>
              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: DATA_COLS.map((c) => `${c.width}px`).join(" "),
                  background: bg,
                  borderBottom: border,
                }}
              >
                {DATA_COLS.map((col) => (
                  <Box key={col.label} sx={{ px: 2, py: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#9e8a80",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {col.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Body */}
              <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="body2" sx={{ color: "#b0978a" }}>
                      No reservations found
                    </Typography>
                  </Box>
                ) : (
                  filtered.map((r, idx) => {
                    const statusCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                    return (
                      <Box
                        key={r.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: DATA_COLS.map((c) => `${c.width}px`).join(" "),
                          borderBottom: idx < filtered.length - 1 ? border : "none",
                          alignItems: "center",
                          "&:hover": { background: bg },
                        }}
                      >
                        {/* Guest */}
                        <Box sx={{ px: 2, py: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3 }}>
                            <Typography
                              sx={{ fontSize: "13px", color: "#2c2420", fontWeight: 500 }}
                            >
                              {r.billing_name || r.user_name || "—"}
                            </Typography>
                          </Box>
                          {r.email && (
                            <Typography sx={{ fontSize: "11px", color: "#9e8a80" }}>
                              {r.email}
                            </Typography>
                          )}
                        </Box>

                        {/* Dates */}
                        <Box sx={{ px: 2, py: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Typography sx={{ fontSize: "12px", color: "#2c2420" }}>
                                {r.start_date}
                              </Typography>
                              <ArrowRightAltOutlined sx={{ fontSize: 16, color: "#9e8a80" }} />
                              <Typography sx={{ fontSize: "12px", color: "#2c2420" }}>
                                {r.end_date}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Guests */}
                        <Box sx={{ px: 2, py: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography sx={{ fontSize: "13px", color: "#2c2420" }}>
                              {(r.guests_over || 0) + (r.guests_under || 0)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Total */}
                        <Box sx={{ px: 2, py: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                            <Typography
                              sx={{ fontSize: "13px", color: "#2c2420", fontWeight: 500 }}
                            >
                              {r.total_price?.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Paid */}
                        <Box sx={{ px: 2, py: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: r.amount_paid >= r.total_price ? "#1a6b3c" : "#b8860b",
                              }}
                            >
                              {r.amount_paid?.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Method */}
                        <Box sx={{ px: 2, py: 2 }}>
                          <Chip
                            label={r.payment_method || "—"}
                            size="small"
                            sx={{
                              fontSize: "11px",
                              background: "#f5f5f5",
                              color: "#4a4a4a",
                              border: "1px solid #e0e0e0",
                              height: 22,
                            }}
                          />
                        </Box>

                        {/* Reservation ID */}
                        <Box sx={{ px: 2, py: 2 }}>
                          <Tooltip title={r.id} placement="top">
                            <Typography
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "11px",
                                color: brown,
                                background: "#fdf0e8",
                                border: "1px solid #e8c4a8",
                                borderRadius: 1,
                                px: 1,
                                py: 0.3,
                                display: "block",
                                textAlign: "center",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "default",
                              }}
                            >
                              {r.id}
                            </Typography>
                          </Tooltip>
                        </Box>

                        {/* Status */}
                        <Box sx={{ px: 2, py: 2 }}>
                          <Select
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                            size="small"
                            sx={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: statusCfg.color,
                              background: statusCfg.bg,
                              border: `1px solid ${statusCfg.border}`,
                              borderRadius: 2,
                              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                              "& .MuiSelect-icon": { color: statusCfg.color },
                            }}
                          >
                            {statusOptions.map((s) => (
                              <MenuItem key={s} value={s} sx={{ fontSize: "12px" }}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>

          {/* Right: sticky actions column */}
          <Box
            sx={{
              width: ACTIONS_WIDTH,
              flexShrink: 0,
              borderLeft: border,
              background: "#fff",
            }}
          >
            {/* Actions header */}
            <Box sx={{ px: 2, py: 1.5, background: bg, borderBottom: border }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9e8a80",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Actions
              </Typography>
            </Box>

            {/* Actions body */}
            <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <Box sx={{ height: 80 }} />
              ) : (
                filtered.map((r, idx) => {
                  const backup = backupReservations.find((b) => b.id === r.id);
                  const isDirty = r.status !== backup?.status;
                  return (
                    <Box
                      key={r.id}
                      sx={{
                        px: 2,
                        py: 2,
                        borderBottom: idx < filtered.length - 1 ? border : "none",
                        display: "flex",
                        gap: 0.75,
                        flexWrap: "wrap",
                        alignItems: "center",
                        minHeight: 72,
                        "&:hover": { background: bg },
                      }}
                    >
                      {/* Save */}
                      {isDirty && (
                        <Tooltip title="Save status">
                          <span>
                            <MKButton
                              size="small"
                              onClick={() => handleSave(r.id)}
                              disabled={saving[r.id]}
                              sx={{
                                minWidth: 0,
                                px: 1.5,
                                fontSize: "11px",
                                background: "#1a6b3c",
                                color: "#fff",
                                "&:hover": { background: "#145c32" },
                              }}
                              startIcon={<SaveOutlined sx={{ fontSize: "14px !important" }} />}
                            >
                              {saving[r.id] ? "…" : "Save"}
                            </MKButton>
                          </span>
                        </Tooltip>
                      )}

                      {/* Confirm IBAN */}
                      {(r.status === "pending" || r.status === "confirmed") &&
                        r.payment_method === "iban" && (
                          <Tooltip title="Confirm payment">
                            <span>
                              <MKButton
                                size="small"
                                onClick={() =>
                                  handleSave(r.id, r.status === "pending" ? "confirmed" : "paid")
                                }
                                disabled={saving[r.id]}
                                sx={{
                                  minWidth: 0,
                                  px: 1.5,
                                  fontSize: "11px",
                                  background: "#1565c0",
                                  color: "#fff",
                                  "&:hover": { background: "#0d47a1" },
                                }}
                                startIcon={
                                  <CheckCircleOutlined sx={{ fontSize: "14px !important" }} />
                                }
                              >
                                {r.status === "pending"
                                  ? "confirm deposit"
                                  : "confirm full payment"}
                              </MKButton>
                            </span>
                          </Tooltip>
                        )}

                      {/* Settle deposit */}
                      {r.status === "paid" && (
                        <Tooltip title="Settle security deposit">
                          <span>
                            <MKButton
                              size="small"
                              onClick={() => handleSecurityDeposit(r.id)}
                              sx={{
                                minWidth: 0,
                                px: 1.5,
                                fontSize: "11px",
                                background: brown,
                                color: "#fff",
                                "&:hover": { background: brownLight },
                              }}
                              startIcon={
                                <AccountBalanceOutlined sx={{ fontSize: "14px !important" }} />
                              }
                            >
                              Settle Security Deposit
                            </MKButton>
                          </span>
                        </Tooltip>
                      )}

                      {/* Invoice */}
                      {r.status === "completed" && (
                        <Tooltip title="Download invoice">
                          <span>
                            <MKButton
                              disableRipple
                              disableTouchRipple
                              size="small"
                              onClick={() => handleDownloadInvoice(r.id)}
                              disabled={invoicing[r.id]}
                              sx={{
                                minWidth: 0,
                                px: 1.5,
                                fontSize: "11px",
                                background: "#4a4a4a",
                                color: "#fff",
                                "&:hover": { background: "#333" },
                                "&:active": { background: "#222" },
                                "&:focus": { background: "#4a4a4a" },
                                "&:focus-visible": { background: "#4a4a4a" },
                                "&.Mui-disabled": { background: "#4a4a4a", color: "#fff" },
                              }}
                              startIcon={
                                invoicing[r.id] ? (
                                  <CircularProgress size={12} sx={{ color: "#fff" }} />
                                ) : (
                                  <ReceiptLongOutlined sx={{ fontSize: "14px !important" }} />
                                )
                              }
                            >
                              {invoicing[r.id] ? "Generating…" : "Invoice"}
                            </MKButton>
                          </span>
                        </Tooltip>
                      )}

                      {/* Delete */}
                      {(r.status === "pending" || r.status === "cancelled") && (
                        <Tooltip title="Delete reservation">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(r.id)}
                            sx={{
                              color: "#b0978a",
                              border: "1px solid #ede5db",
                              borderRadius: 1.5,
                              p: 0.6,
                              "&:hover": {
                                color: "#c0392b",
                                borderColor: "#f5b7b1",
                                background: "#fef0ee",
                              },
                            }}
                          >
                            <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* No actions placeholder */}
                      {!isDirty &&
                        !(
                          (r.status === "pending" || r.status === "confirmed") &&
                          r.payment_method === "iban"
                        ) &&
                        r.status !== "paid" &&
                        r.status !== "completed" &&
                        r.status !== "pending" &&
                        r.status !== "cancelled" && (
                          <Typography
                            variant="caption"
                            sx={{ color: "#c8b8b0", fontStyle: "italic" }}
                          >
                            —
                          </Typography>
                        )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: "#b0978a", mt: 1.5, display: "block" }}>
        Showing {filtered.length} of {reservations.length} reservations
      </Typography>
    </MKBox>
  );
}
