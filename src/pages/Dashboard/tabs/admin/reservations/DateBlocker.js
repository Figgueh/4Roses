import { useState, useEffect, useCallback } from "react";
import AvailabilityCalendar from "components/Booking/AvailabilityCalendar";
import supabase from "connection/client";
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockIcon from "@mui/icons-material/Block";

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

export default function BlockedDays() {
  const [blockingData, setBlockingData] = useState({ selectedDates: {}, guests_over: 1 });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthBlocks, setMonthBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  const selectedKeys = Object.keys(blockingData.selectedDates).sort();
  const startDate = selectedKeys[0] ?? null;
  const endDate = selectedKeys[selectedKeys.length - 1] ?? null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch blocked_days rows that overlap the currently viewed month
  const fetchMonthBlocks = useCallback(async () => {
    setLoadingBlocks(true);
    const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const monthEnd = new Date(year, month + 1, 0);
    const monthEndStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      monthEnd.getDate()
    ).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("blocked_days")
      .select("*")
      .lte("start_date", monthEndStr)
      .gte("end_date", monthStart)
      .order("start_date", { ascending: true });

    if (!error) setMonthBlocks(data || []);
    setLoadingBlocks(false);
  }, [year, month]);

  useEffect(() => {
    fetchMonthBlocks();
  }, [fetchMonthBlocks]);

  const handleConfirm = async () => {
    if (!startDate || !endDate) return;
    setSaving(true);

    const ranges = [];
    let rangeStart = selectedKeys[0];
    let prev = selectedKeys[0];

    for (let i = 1; i < selectedKeys.length; i++) {
      const curr = selectedKeys[i];
      const diff = (new Date(curr) - new Date(prev)) / 86400000;
      if (diff !== 1) {
        ranges.push({ start_date: rangeStart, end_date: prev });
        rangeStart = curr;
      }
      prev = curr;
    }
    ranges.push({ start_date: rangeStart, end_date: prev });

    const { error } = await supabase.from("blocked_days").insert(ranges);

    if (error) {
      setToast({ open: true, message: "Failed to save blocked dates.", severity: "error" });
    } else {
      setToast({
        open: true,
        message: `Blocked ${ranges.length} range(s) successfully.`,
        severity: "success",
      });
      setBlockingData({ selectedDates: {}, guests_over: 1 });
      fetchMonthBlocks();
    }
    setSaving(false);
  };

  const handleDeleteEntry = async (id) => {
    setDeleting(true);
    const { error } = await supabase.from("blocked_days").delete().eq("id", id);
    if (error) setToast({ open: true, message: "Failed to delete.", severity: "error" });
    else {
      setToast({ open: true, message: "Block removed.", severity: "success" });
      fetchMonthBlocks();
    }
    setDeleting(false);
  };

  const handleDeleteAll = async () => {
    if (!monthBlocks.length) return;
    setDeleting(true);
    const ids = monthBlocks.map((b) => b.id);
    const { error } = await supabase.from("blocked_days").delete().in("id", ids);
    if (error) setToast({ open: true, message: "Failed to delete.", severity: "error" });
    else {
      setToast({
        open: true,
        message: `Cleared all blocks for ${MONTHS[month]}.`,
        severity: "success",
      });
      fetchMonthBlocks();
    }
    setDeleting(false);
  };

  const handleClear = () => setBlockingData({ selectedDates: {}, guests_over: 1 });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 4 } }}>
      {/* Calendar */}
      <Box>
        <AvailabilityCalendar
          icsUrls={[
            {
              url: "https://www.airbnb.ca/calendar/ical/685302237883325603.ics?s=eac91e56e2412fa2d4e6e3a2cd41361a",
              name: "Airbnb",
            },
            {
              url: "https://ical.booking.com/v1/export?t=b6fb13e3-9a9e-4502-8d65-5cda7784b6a7",
              name: "Booking.com",
            },
            {
              url: "http://www.vrbo.com/icalendar/23c22c9fe2234081906c2953e22e43d4.ics?nonTentative",
              name: "VRBO",
            },
            { url: `${process.env.REACT_APP_BACKEND}/bookings/calendar.ics`, name: "4Roses" },
          ]}
          selectedDates={blockingData.selectedDates}
          onSelectionChange={(selectedDates) =>
            setBlockingData((prev) => ({ ...prev, selectedDates }))
          }
          isContinuousCheck={false}
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {/* Selection panel */}
        <Card
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 280,
            border: "1px solid #ede5db",
            borderRadius: 3,
            background: "#fff",
          }}
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
              Selected Dates
            </Typography>
            <Typography variant="caption" sx={{ color: "#9e8a80" }}>
              {selectedKeys.length === 0
                ? "No dates selected"
                : `${selectedKeys.length} day${selectedKeys.length !== 1 ? "s" : ""} selected`}
            </Typography>
          </Box>

          <Box sx={{ px: 2, py: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedKeys.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  py: 4,
                  width: "100%",
                }}
              >
                <CalendarMonthIcon sx={{ color: "#ede5db", fontSize: 36, mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#b0978a", fontSize: "12px" }}>
                  Drag to select dates on the calendar
                </Typography>
              </Box>
            ) : (
              selectedKeys.map((date) => (
                <Box
                  key={date}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: "#fdf8f3",
                    border: "1px solid #ede5db",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#2c2420", fontSize: "12px" }}>
                    {new Date(date + "T00:00:00").toLocaleDateString("en-CA", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          {selectedKeys.length > 0 && (
            <Box sx={{ px: 3, pb: 3 }}>
              <Divider sx={{ mb: 2, borderColor: "#ede5db" }} />
              <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, background: "#fdf0e8" }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#8b4513", fontWeight: 600, display: "block" }}
                >
                  {startDate === endDate ? startDate : `${startDate} → ${endDate}`}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={handleConfirm}
                disabled={saving}
                startIcon={
                  saving ? (
                    <CircularProgress size={12} sx={{ color: "#fff" }} />
                  ) : (
                    <CheckIcon sx={{ fontSize: 14 }} />
                  )
                }
                sx={{
                  mb: 1,
                  fontSize: "11px",
                  background: "#8b4513",
                  "&:hover": { background: "#7a3c10" },
                  color: "#fff",
                }}
              >
                Confirm Block
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleClear}
                disabled={saving}
                startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontSize: "11px",
                  borderColor: "#ede5db",
                  color: "#9e8a80",
                  "&:hover": { borderColor: "#8b4513", color: "#8b4513" },
                }}
              >
                Clear
              </Button>
            </Box>
          )}
        </Card>

        {/* Month blocks panel */}
        <Card
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 280,
            border: "1px solid #ede5db",
            borderRadius: 3,
            background: "#fff",
          }}
        >
          <Box
            sx={{
              px: 3,
              pt: 2.5,
              pb: 2,
              borderBottom: "1px solid #ede5db",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1e1612",
                }}
              >
                Blocked in {MONTHS[month]}
              </Typography>
              <Typography variant="caption" sx={{ color: "#9e8a80" }}>
                Manually blocked only
              </Typography>
            </Box>
            {monthBlocks.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                disabled={deleting}
                onClick={handleDeleteAll}
                sx={{
                  fontSize: "10px",
                  borderColor: "#ede5db",
                  color: "#9e8a80",
                  "&:hover": { borderColor: "#c0392b", color: "#c0392b" },
                }}
              >
                Clear All
              </Button>
            )}
          </Box>

          <Box
            sx={{
              px: 2,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {loadingBlocks ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ color: "#8b4513" }} />
              </Box>
            ) : monthBlocks.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  py: 4,
                  width: "100%",
                }}
              >
                <CalendarMonthIcon sx={{ color: "#ede5db", fontSize: 36, mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#b0978a", fontSize: "12px" }}>
                  No manually blocked dates this month
                </Typography>
              </Box>
            ) : (
              monthBlocks.map((b) => (
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3 }}>
                      <BlockIcon sx={{ fontSize: 11, color: "#8b4513" }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#8b4513",
                          fontWeight: 600,
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
                    onClick={() => handleDeleteEntry(b.id)}
                    disabled={deleting}
                    sx={{ color: "#b0978a", "&:hover": { color: "#c0392b" } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))
            )}
          </Box>
        </Card>
      </Box>

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
