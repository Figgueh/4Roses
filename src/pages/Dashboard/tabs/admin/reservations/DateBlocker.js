import { useState, useEffect, useCallback } from "react";
import supabase from "connection/client";

import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Divider,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BlockIcon from "@mui/icons-material/Block";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SyncIcon from "@mui/icons-material/Sync";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
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

const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const isInRange = (dateStr, start, end) => {
  if (!start || !end) return false;
  const s = start < end ? start : end;
  const e = start < end ? end : start;
  return dateStr >= s && dateStr <= e;
};

// Parse iCal VEVENT dates → array of { start, end } date strings
const parseIcal = (text) => {
  const events = [];
  const eventBlocks = text.split("BEGIN:VEVENT");
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    const dtstart = block.match(/DTSTART[^:]*:(\d{8})/);
    const dtend = block.match(/DTEND[^:]*:(\d{8})/);
    if (dtstart && dtend) {
      const toStr = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
      const start = toStr(dtstart[1]);
      // iCal DTEND for all-day is exclusive, so subtract 1 day
      const endDate = new Date(
        dtend[1].slice(0, 4),
        parseInt(dtend[1].slice(4, 6)) - 1,
        parseInt(dtend[1].slice(6, 8)) - 1
      );
      events.push({ start, end: toDateStr(endDate) });
    }
  }
  return events;
};

const EXTERNAL_CALENDARS = [
  {
    url: "https://www.airbnb.ca/calendar/ical/685302237883325603.ics?s=eac91e56e2412fa2d4e6e3a2cd41361a",
    name: "Airbnb",
    color: "#FF5A5F",
  },
  {
    url: "https://ical.booking.com/v1/export?t=b6fb13e3-9a9e-4502-8d65-5cda7784b6a7",
    name: "Booking.com",
    color: "#003580",
  },
  {
    url: "http://www.vrbo.com/icalendar/23c22c9fe2234081906c2953e22e43d4.ics?nonTentative",
    name: "VRBO",
    color: "#3D6B84",
  },
  {
    url: `${process.env.REACT_APP_BACKEND}/bookings/calendar.ics`,
    name: "4Roses",
    color: "#8b4513",
  },
];

const PROXY = `${process.env.REACT_APP_BACKEND}/proxy-ical?url=`;

export default function BlockedDays() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedDays, setBlockedDays] = useState([]);
  const [externalDays, setExternalDays] = useState([]); // [{ start, end, source }]
  const [calLoading, setCalLoading] = useState(false);
  const [mode, setMode] = useState("single");

  // Pending selection — not yet confirmed
  const [pendingSingle, setPendingSingle] = useState(null); // dateStr
  const [pendingRange, setPendingRange] = useState({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState(null);

  const [loading, setSaving_] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = toDateStr(new Date());

  const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

  // ── Fetch from Supabase ───────────────────────────────────────────
  const fetchBlockedDays = useCallback(async () => {
    setSaving_(true);
    const { data, error } = await supabase
      .from("blocked_days")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) showToast("Failed to load blocked days.", "error");
    else setBlockedDays(data || []);
    setSaving_(false);
  }, []);

  // ── Fetch external calendars via proxy ────────────────────────────
  const fetchExternalCalendars = useCallback(async () => {
    setCalLoading(true);
    const all = [];
    await Promise.all(
      EXTERNAL_CALENDARS.map(async (cal) => {
        try {
          const res = await fetch(`${PROXY}${encodeURIComponent(cal.url)}`);
          const text = await res.text();
          const events = parseIcal(text);
          events.forEach((e) => all.push({ ...e, source: cal.name, color: cal.color }));
        } catch {
          console.warn(`Could not fetch ${cal.name} calendar`);
        }
      })
    );
    setExternalDays(all);
    setCalLoading(false);
  }, []);

  useEffect(() => {
    fetchBlockedDays();
    fetchExternalCalendars();
  }, []);

  // ── Date state helpers ────────────────────────────────────────────
  const isDateBlocked = (dateStr) =>
    blockedDays.some((b) => dateStr >= b.start_date && dateStr <= b.end_date);

  const getBlockedEntry = (dateStr) =>
    blockedDays.find((b) => dateStr >= b.start_date && dateStr <= b.end_date);

  const getExternalSource = (dateStr) =>
    externalDays.find((e) => dateStr >= e.start && dateStr <= e.end);

  const isPending = (dateStr) => {
    if (mode === "single") return dateStr === pendingSingle;
    if (pendingRange.start && pendingRange.end)
      return isInRange(dateStr, pendingRange.start, pendingRange.end);
    return dateStr === pendingRange.start;
  };

  const isHoverPreview = (dateStr) => {
    if (mode !== "range" || !pendingRange.start || pendingRange.end) return false;
    if (!hoverDate) return false;
    return isInRange(dateStr, pendingRange.start, hoverDate);
  };

  // ── Calendar clicks ───────────────────────────────────────────────
  const handleDayClick = (dateStr) => {
    // If already blocked in Supabase, clicking unblocks immediately (no confirm needed)
    const entry = getBlockedEntry(dateStr);
    if (entry) {
      unblockEntry(entry.id);
      return;
    }

    if (mode === "single") {
      setPendingSingle(dateStr === pendingSingle ? null : dateStr);
      setPendingRange({ start: null, end: null });
      return;
    }

    // Range mode
    if (!pendingRange.start || pendingRange.end) {
      // Start fresh range
      setPendingRange({ start: dateStr, end: null });
      setPendingSingle(null);
    } else {
      // Complete the range
      const s = pendingRange.start < dateStr ? pendingRange.start : dateStr;
      const e = pendingRange.start < dateStr ? dateStr : pendingRange.start;
      setPendingRange({ start: s, end: e });
      setHoverDate(null);
    }
  };

  const cancelPending = () => {
    setPendingSingle(null);
    setPendingRange({ start: null, end: null });
    setHoverDate(null);
  };

  const confirmBlock = async () => {
    const start = mode === "single" ? pendingSingle : pendingRange.start;
    const end = mode === "single" ? pendingSingle : pendingRange.end;
    if (!start || !end) return;

    setSaving(true);
    const { error } = await supabase
      .from("blocked_days")
      .insert({ start_date: start, end_date: end });

    if (error) {
      showToast("Failed to block dates.", "error");
    } else {
      showToast(start === end ? "Day blocked." : "Date range blocked.");
      cancelPending();
      await fetchBlockedDays();
    }
    setSaving(false);
  };

  const unblockEntry = async (id) => {
    setSaving(true);
    const { error } = await supabase.from("blocked_days").delete().eq("id", id);
    if (error) showToast("Failed to unblock.", "error");
    else {
      showToast("Unblocked.");
      await fetchBlockedDays();
    }
    setSaving(false);
  };

  // ── Calendar grid ─────────────────────────────────────────────────
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const hasPendingConfirm =
    pendingSingle !== null || (pendingRange.start !== null && pendingRange.end !== null);

  const upcoming = blockedDays.filter((b) => b.end_date >= today);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 980, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              color: "#1e1612",
              mb: 0.5,
            }}
          >
            Availability Manager
          </Typography>
          <Typography variant="body2" sx={{ color: "#9e8a80" }}>
            Select days to block then confirm. External bookings are shown automatically.
          </Typography>
        </Box>
        <Button
          startIcon={
            calLoading ? <CircularProgress size={14} sx={{ color: "#8b4513" }} /> : <SyncIcon />
          }
          onClick={fetchExternalCalendars}
          disabled={calLoading}
          size="small"
          sx={{
            borderColor: "#ede5db",
            color: "#9e8a80",
            border: "1px solid #ede5db",
            borderRadius: 2,
            fontSize: "11px",
            "&:hover": { borderColor: "#8b4513", color: "#8b4513" },
          }}
        >
          Sync Calendars
        </Button>
      </Box>

      {/* External calendar legend */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        {EXTERNAL_CALENDARS.map((cal) => (
          <Chip
            key={cal.name}
            label={cal.name}
            size="small"
            sx={{
              background: cal.color + "18",
              color: cal.color,
              border: `1px solid ${cal.color}40`,
              fontWeight: 500,
              fontSize: "10px",
              letterSpacing: "0.03em",
            }}
          />
        ))}
        <Chip
          label="Manually Blocked"
          size="small"
          sx={{
            background: "#fdf0e8",
            color: "#8b4513",
            border: "1px solid #e8c4a8",
            fontWeight: 500,
            fontSize: "10px",
          }}
        />
        <Chip
          label="Pending"
          size="small"
          sx={{
            background: "#fffbe6",
            color: "#b8860b",
            border: "1px dashed #c9a96e",
            fontWeight: 500,
            fontSize: "10px",
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* ── Calendar ── */}
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #ede5db",
              borderRadius: 3,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {/* Mode toggle + confirm bar */}
            <Box
              sx={{
                px: 3,
                pt: 2.5,
                pb: 2,
                borderBottom: "1px solid #ede5db",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <ToggleButtonGroup
                value={mode}
                exclusive
                size="small"
                onChange={(_, v) => {
                  if (v) {
                    setMode(v);
                    cancelPending();
                  }
                }}
                sx={{
                  "& .MuiToggleButton-root": {
                    border: "1px solid #ede5db",
                    color: "#9e8a80",
                    fontSize: "11px",
                    px: 1.5,
                    "&.Mui-selected": {
                      background: "#8b4513",
                      color: "#fff",
                      borderColor: "#8b4513",
                      "&:hover": { background: "#7a3c10" },
                    },
                  },
                }}
              >
                <ToggleButton value="single">
                  <CalendarMonthIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Single
                </ToggleButton>
                <ToggleButton value="range">
                  <DateRangeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Range
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Confirm / cancel buttons */}
              {hasPendingConfirm ? (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={cancelPending}
                    startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontSize: "11px",
                      borderColor: "#ede5db",
                      color: "#9e8a80",
                      "&:hover": { borderColor: "#8b4513", color: "#8b4513" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={confirmBlock}
                    disabled={saving}
                    startIcon={
                      saving ? (
                        <CircularProgress size={12} sx={{ color: "#fff" }} />
                      ) : (
                        <CheckIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{
                      fontSize: "11px",
                      background: "#8b4513",
                      "&:hover": { background: "#7a3c10" },
                    }}
                  >
                    Confirm Block
                  </Button>
                </Box>
              ) : mode === "range" && pendingRange.start && !pendingRange.end ? (
                <Typography variant="caption" sx={{ color: "#8b4513", fontStyle: "italic" }}>
                  Now select an end date…
                </Typography>
              ) : null}
            </Box>

            {/* Month nav */}
            <Box
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <IconButton
                size="small"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                sx={{ color: "#8b4513" }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#1e1612",
                }}
              >
                {MONTHS[month]} {year}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                sx={{ color: "#8b4513" }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Day headers */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", px: 2 }}>
              {DAYS.map((d) => (
                <Box key={d} sx={{ textAlign: "center", py: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "#b0978a", letterSpacing: "0.1em", fontSize: "10px" }}
                  >
                    {d}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Cells */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={28} sx={{ color: "#8b4513" }} />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  px: 2,
                  pb: 2,
                  gap: 0.5,
                }}
              >
                {cells.map((date, i) => {
                  if (!date) return <Box key={`e-${i}`} />;
                  const dateStr = toDateStr(date);
                  const blocked = isDateBlocked(dateStr);
                  const external = getExternalSource(dateStr);
                  const pending = isPending(dateStr);
                  const preview = isHoverPreview(dateStr);
                  const isToday = dateStr === today;
                  const isPast = dateStr < today;

                  let bg = "transparent";
                  let color = isPast ? "#c8b8b0" : "#2c2420";
                  let border = "1px solid transparent";
                  let title = "";

                  if (external) {
                    bg = external.color + "18";
                    color = external.color;
                    border = `1px solid ${external.color}40`;
                    title = `Booked via ${external.source}`;
                  }
                  if (blocked) {
                    bg = "#fdf0e8";
                    color = "#8b4513";
                    border = "1px solid #e8c4a8";
                    title = "Manually blocked — click to unblock";
                  }
                  if (preview) {
                    bg = "#fffbe6";
                    border = "1px dashed #c9a96e";
                    color = "#b8860b";
                  }
                  if (pending) {
                    bg = "#fffbe6";
                    border = "1px dashed #c9a96e";
                    color = "#b8860b";
                    if (
                      dateStr === pendingSingle ||
                      dateStr === pendingRange.start ||
                      dateStr === pendingRange.end
                    ) {
                      bg = "#c9a96e";
                      color = "#fff";
                      border = "1px solid #c9a96e";
                    }
                  }
                  if (isToday && !blocked && !pending && !external) border = "1px solid #c9a96e";
                  if (isPast) {
                    bg = "transparent";
                    color = "#c8b8b0";
                    border = "1px solid transparent";
                  }

                  return (
                    <Tooltip key={dateStr} title={title} placement="top">
                      <Box
                        onClick={() => !isPast && !external && handleDayClick(dateStr)}
                        onMouseEnter={() => {
                          if (pendingRange.start && !pendingRange.end) setHoverDate(dateStr);
                        }}
                        onMouseLeave={() => setHoverDate(null)}
                        sx={{
                          aspectRatio: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "6px",
                          cursor: isPast || (external && !blocked) ? "default" : "pointer",
                          background: bg,
                          border,
                          color,
                          fontSize: "13px",
                          fontWeight: isToday ? 600 : 400,
                          transition: "all 0.15s ease",
                          position: "relative",
                          "&:hover":
                            !isPast && !external
                              ? {
                                  background: blocked ? "#f5e0d0" : "#fdf8f3",
                                  border: "1px solid #c9a96e",
                                }
                              : {},
                        }}
                      >
                        {date.getDate()}
                        {/* Dot indicator for external */}
                        {external && !blocked && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 2,
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: external.color,
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            )}

            {/* Legend */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: "1px solid #ede5db",
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {[
                { bg: "#fdf0e8", border: "#e8c4a8", label: "Blocked" },
                { bg: "#fffbe6", border: "#c9a96e", dashed: true, label: "Pending" },
                { bg: "transparent", border: "#c9a96e", label: "Today" },
                { bg: "#c8b8b0", border: "transparent", label: "Past" },
              ].map(({ bg, border, dashed, label }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "3px",
                      background: bg,
                      border: dashed ? `1px dashed ${border}` : `1px solid ${border}`,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#9e8a80", fontSize: "10px" }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* ── Sidebar ── */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{ border: "1px solid #ede5db", borderRadius: 3, background: "#fff" }}
          >
            <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: "1px solid #ede5db" }}>
              <Typography
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1e1612",
                }}
              >
                Blocked Periods
              </Typography>
              <Typography variant="caption" sx={{ color: "#9e8a80" }}>
                Manually blocked only
              </Typography>
            </Box>

            <Box
              sx={{
                px: 2,
                py: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={24} sx={{ color: "#8b4513" }} />
                </Box>
              ) : upcoming.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CalendarMonthIcon sx={{ color: "#ede5db", fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: "#b0978a" }}>
                    No blocked periods
                  </Typography>
                </Box>
              ) : (
                upcoming.map((b) => (
                  <Box
                    key={b.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      background: "#fdf8f3",
                      border: "1px solid #ede5db",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                        <BlockIcon sx={{ fontSize: 12, color: "#8b4513" }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#8b4513",
                            fontWeight: 500,
                            fontSize: "10px",
                            letterSpacing: "0.05em",
                          }}
                        >
                          BLOCKED
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#2c2420", fontSize: "12px" }}>
                        {b.start_date === b.end_date
                          ? b.start_date
                          : `${b.start_date} → ${b.end_date}`}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => unblockEntry(b.id)}
                      disabled={saving}
                      sx={{ color: "#b0978a", "&:hover": { color: "#8b4513" } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>

            {upcoming.length > 0 && (
              <Box sx={{ px: 3, pb: 3 }}>
                <Divider sx={{ mb: 2, borderColor: "#ede5db" }} />
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true);
                    const { error } = await supabase
                      .from("blocked_days")
                      .delete()
                      .gte("end_date", today);
                    if (error) showToast("Failed to clear.", "error");
                    else {
                      showToast("All cleared.");
                      await fetchBlockedDays();
                    }
                    setSaving(false);
                  }}
                  sx={{
                    borderColor: "#ede5db",
                    color: "#9e8a80",
                    fontSize: "11px",
                    "&:hover": { borderColor: "#8b4513", color: "#8b4513" },
                  }}
                >
                  Clear All Upcoming
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

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
