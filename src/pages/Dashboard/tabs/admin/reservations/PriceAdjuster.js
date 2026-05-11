import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Box,
  Card,
  Typography,
  IconButton,
  Chip,
  Autocomplete,
  Snackbar,
} from "@mui/material";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import { Save, Add, DeleteOutline, TuneOutlined, CalendarMonthOutlined } from "@mui/icons-material";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ── Shared styles consistent with the rest of the app ────────────────────────
const serif = "'Cormorant Garamond', serif";
const brown = "#8b4513";
const brownLight = "#7a3c10";
const border = "1px solid #ede5db";
const bg = "#fdf8f3";

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

// ── Monthly pricing tab ───────────────────────────────────────────────────────
function MonthlyPricing() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/billings/monthlyPrice`);
        const pricingArray = Object.entries(data).map(([month, price]) => ({
          month: parseInt(month),
          price,
        }));
        setPricing(pricingArray);
      } catch {
        setError("Failed to load monthly pricing.");
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handlePriceChange = (monthIndex, value) => {
    setPricing((prev) =>
      prev.map((item) => (item.month === monthIndex ? { ...item, price: value } : item))
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND}/billings/monthlyPrice`, { pricing });
      setSuccess("All prices updated successfully!");
    } catch {
      setError("Failed to update pricing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <MKBox display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: brown }} />
      </MKBox>
    );

  return (
    <Box>
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          <AlertTitle>Success</AlertTitle>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Card elevation={0} sx={{ border, borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ display: "table-header-group" }}>
              <TableRow sx={{ background: bg }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#1e1612",
                    fontSize: "12px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Month
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#1e1612",
                    fontSize: "12px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Price per night (€)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pricing.map((item) => (
                <TableRow key={item.month} sx={{ "&:hover": { background: bg } }}>
                  <TableCell sx={{ color: "#2c2420", fontWeight: 500 }}>
                    {months[item.month]}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.price}
                      onChange={(e) => handlePriceChange(item.month, Number(e.target.value))}
                      size="small"
                      variant="outlined"
                      InputProps={{
                        startAdornment: <span style={{ color: "#9e8a80", marginRight: 4 }}>€</span>,
                      }}
                      sx={{
                        width: 130,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&.Mui-focused fieldset": { borderColor: brown },
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Box mt={3} textAlign="right">
        <MKButton
          variant="gradient"
          color="info"
          size="medium"
          startIcon={<Save />}
          onClick={handleSaveAll}
          disabled={saving}
          sx={{ background: brown, "&:hover": { background: brownLight } }}
        >
          {saving ? "Saving..." : "Save All"}
        </MKButton>
      </Box>
    </Box>
  );
}

// ── Date range overrides tab ──────────────────────────────────────────────────
function DateRangeOverrides() {
  const [overrides, setOverrides] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // New override form state
  const [form, setForm] = useState({ start_date: "", end_date: "", price: "", account_id: null });

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  // Fetch accounts (profiles/users)
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/users/allUserData`);
        setAccounts(Array.isArray(data) ? data : data.users ?? data.accounts ?? [data]);
      } catch {
        showToast("Failed to load accounts.", "error");
        setAccounts([]);
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const fetchOverrides = useCallback(async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/billings/priceOverrides`);
      setOverrides(data || []);
    } catch {
      showToast("Failed to load overrides.", "error");
    }
  }, []);

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  const handleAdd = async () => {
    const { start_date, end_date, price, account_id } = form;
    if (!start_date || !end_date || !price) {
      showToast("Please fill in start date, end date, and price.", "error");
      return;
    }
    if (start_date > end_date) {
      showToast("Start date must be before end date.", "error");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}/billings/priceOverrides`, {
        start_date,
        end_date,
        price_per_night: Number(price),
        account_id: account_id ?? null,
      });
      showToast("Price override added.");
      setForm({ start_date: "", end_date: "", price: "", account_id: null });
      fetchOverrides();
    } catch {
      showToast("Failed to save override.", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/billings/priceOverrides/${id}`);
      showToast("Override removed.");
      fetchOverrides();
    } catch {
      showToast("Failed to delete.", "error");
    }
    setDeleting(null);
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      fontSize: "13px",
      "&.Mui-focused fieldset": { borderColor: brown },
    },
    "& label.Mui-focused": { color: brown },
  };

  return (
    <Box>
      {/* Add new override card */}
      <Card elevation={0} sx={{ border, borderRadius: 3, mb: 3, background: "#fff" }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: border }}>
          <Typography
            sx={{ fontFamily: serif, fontSize: "18px", fontWeight: 600, color: "#1e1612" }}
          >
            Add Price Override
          </Typography>
          <Typography variant="caption" sx={{ color: "#9e8a80" }}>
            Set a custom nightly rate for a date range, optionally for a specific account
          </Typography>
        </Box>

        <Box
          sx={{ px: 3, py: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}
        >
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={form.start_date}
            onChange={(e) => {
              const newStart = e.target.value;
              setForm((f) => ({
                ...f,
                start_date: newStart,
                end_date: !f.end_date || f.end_date < newStart ? newStart : f.end_date,
              }));
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ ...inputSx, width: 160 }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={form.end_date}
            onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ ...inputSx, width: 160 }}
          />
          <TextField
            label="Price per night (€)"
            type="number"
            size="small"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            InputProps={{
              startAdornment: <span style={{ color: "#9e8a80", marginRight: 4 }}>€</span>,
            }}
            sx={{ ...inputSx, width: 180 }}
          />
          <Autocomplete
            options={accounts}
            getOptionLabel={(o) => `${o.full_name || "—"} (${o.email})`}
            value={accounts.find((a) => a.id === form.account_id) || null}
            onChange={(_, v) => setForm((f) => ({ ...f, account_id: v?.id ?? null }))}
            loading={loadingAccounts}
            size="small"
            sx={{ width: 260 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Account (optional)"
                sx={inputSx}
                InputProps={{ ...params.InputProps, endAdornment: params.InputProps.endAdornment }}
              />
            )}
          />
          <MKButton
            variant="contained"
            size="small"
            onClick={handleAdd}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={12} sx={{ color: "#fff" }} />
              ) : (
                <Add sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              background: brown,
              color: "#fff",
              fontSize: "12px",
              height: 40,
              "&:hover": { background: brownLight },
            }}
          >
            Add Override
          </MKButton>
        </Box>
      </Card>

      {/* Existing overrides list */}
      <Card elevation={0} sx={{ border, borderRadius: 3, background: "#fff" }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: border }}>
          <Typography
            sx={{ fontFamily: serif, fontSize: "18px", fontWeight: 600, color: "#1e1612" }}
          >
            Active Overrides
          </Typography>
          <Typography variant="caption" sx={{ color: "#9e8a80" }}>
            {overrides.length === 0
              ? "No overrides set"
              : `${overrides.length} override${overrides.length !== 1 ? "s" : ""}`}
          </Typography>
        </Box>

        {overrides.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <TuneOutlined sx={{ fontSize: 40, color: "#ede5db", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#b0978a" }}>
              No price overrides yet
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ display: "table-header-group" }}>
                <TableRow sx={{ background: bg }}>
                  {["Date Range", "Price / night", "Account", ""].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 600,
                        color: "#1e1612",
                        fontSize: "12px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {overrides.map((o) => (
                  <TableRow key={o.id} sx={{ "&:hover": { background: bg } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarMonthOutlined sx={{ fontSize: 16, color: "#9e8a80" }} />
                        <Typography variant="body2" sx={{ color: "#2c2420", fontSize: "13px" }}>
                          {o.start_date === o.end_date
                            ? o.start_date
                            : `${o.start_date} → ${o.end_date}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`€${o.price_per_night}`}
                        size="small"
                        sx={{
                          background: "#fdf0e8",
                          color: brown,
                          border: `1px solid #e8c4a8`,
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {o.account_id ? (
                        (() => {
                          const account = accounts.find((a) => a.id === o.account_id);
                          return account ? (
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "13px", color: "#2c2420" }}
                              >
                                {account.full_name || "—"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#9e8a80" }}>
                                {account.email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{ color: "#b0978a", fontStyle: "italic" }}
                            >
                              Unknown account
                            </Typography>
                          );
                        })()
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{ color: "#b0978a", fontStyle: "italic" }}
                        >
                          All accounts
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(o.id)}
                        disabled={deleting === o.id}
                        sx={{ color: "#b0978a", "&:hover": { color: "#c0392b" } }}
                      >
                        {deleting === o.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DeleteOutline fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ fontSize: "13px" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function PriceAdjuster() {
  const [tab, setTab] = useState(0);

  return (
    <MKBox p={4}>
      <MKTypography
        variant="h4"
        sx={{ fontFamily: serif, fontWeight: 600, color: "#1e1612", mb: 0.5 }}
      >
        Pricing
      </MKTypography>
      <Typography variant="body2" sx={{ color: "#9e8a80", mb: 3 }}>
        Manage monthly base rates and custom date range overrides
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: border,
          mb: 0,
          "& .MuiTab-root": {
            fontSize: "13px",
            textTransform: "none",
            color: "#9e8a80",
            minWidth: 0,
            mr: 2,
          },
          "& .Mui-selected": { color: `${"#fff"} !important`, fontWeight: 600 },
          "& .MuiTabs-indicator": { background: brown },
        }}
      >
        <Tab label="Monthly Base Rates" />
        <Tab label="Date Range Overrides" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <MonthlyPricing />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <DateRangeOverrides />
      </TabPanel>
    </MKBox>
  );
}
