import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import { Alert, AlertTitle } from "@mui/material";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Utility to fetch ICS
async function fetchICSFromBackend(url) {
  const backendUrl = `${process.env.REACT_APP_BACKEND}/reservation/ics?url=${encodeURIComponent(
    url
  )}`;
  const response = await fetch(backendUrl);
  if (!response.ok) throw new Error(`Failed to fetch ICS: ${response.status}`);
  return response.text();
}

function parseICS(data, sourceName) {
  const events = data.split("BEGIN:VEVENT").slice(1);
  return events
    .map((event) => {
      const start = event.match(/DTSTART;VALUE=DATE:(\d+)/)?.[1];
      const end = event.match(/DTEND;VALUE=DATE:(\d+)/)?.[1];
      if (!start || !end) return null;
      return {
        start: new Date(start.slice(0, 4), start.slice(4, 6) - 1, start.slice(6, 8)),
        end: new Date(end.slice(0, 4), end.slice(4, 6) - 1, end.slice(6, 8)),
        source: sourceName,
      };
    })
    .filter(Boolean);
}

export default function AvailabilityCalendar({ icsUrls, onSelectionChange }) {
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [dragEndDate, setDragEndDate] = useState(null);
  const [dragMode, setDragMode] = useState(null);
  const [monthlyPrices, setMonthlyPrices] = useState({});
  const [error, setError] = useState("");

  // Load monthly prices
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND}/reservation/monthlyPrice`)
      .then((res) => res.json())
      .then(setMonthlyPrices);
  }, []);

  // Load ICS
  useEffect(() => {
    const load = async () => {
      if (!icsUrls || !icsUrls.length) return;
      try {
        const results = await Promise.all(
          icsUrls.map((s) => fetchICSFromBackend(s.url).then((text) => parseICS(text, s.name)))
        );
        const allEvents = results.flat();
        const set = new Set();
        allEvents.forEach((b) => {
          const current = new Date(b.start);
          while (current < b.end) {
            set.add(current.toISOString().split("T")[0]);
            current.setDate(current.getDate() + 1);
          }
        });
        setBlockedDates(set);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [icsUrls]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isBlocked = (date) => blockedDates.has(date.toISOString().split("T")[0]);

  const getPriceForDate = (date) => monthlyPrices[date.getMonth()] ?? "--";

  // Drag handlers
  const handleMouseDown = (date) => {
    if (isBlocked(date)) return;
    const key = date.toISOString().split("T")[0];
    setDragMode(selectedDates[key] ? "unselect" : "select");
    setIsDragging(true);
    setDragStartDate(date);
    setDragEndDate(date);
  };

  const handleMouseEnter = (date) => {
    if (isDragging && !isBlocked(date)) setDragEndDate(date);
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStartDate || !dragEndDate) return;
    const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
    const end = dragStartDate > dragEndDate ? dragStartDate : dragEndDate;

    const newSelected = { ...selectedDates };
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      if (isBlocked(d)) continue;
      if (dragMode === "select") newSelected[key] = getPriceForDate(d);
      if (dragMode === "unselect") delete newSelected[key];
    }

    if (!validateContinuousDates(newSelected)) {
      setError("Selected dates must be continuous!");
    } else {
      setSelectedDates(newSelected);
      setError("");
      onSelectionChange?.(newSelected, monthlyPrices); // pass to parent
    }

    setIsDragging(false);
    setDragStartDate(null);
    setDragEndDate(null);
    setDragMode(null);
  };

  function validateContinuousDates(dates) {
    const keys = Object.keys(dates).sort();
    for (let i = 1; i < keys.length; i++) {
      const prev = new Date(keys[i - 1]);
      const curr = new Date(keys[i]);
      if ((curr - prev) / (1000 * 60 * 60 * 24) !== 1) return false;
    }
    return true;
  }

  const isInDragRange = (date) => {
    if (!isDragging || !dragStartDate || !dragEndDate) return false;
    const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
    const end = dragStartDate > dragEndDate ? dragStartDate : dragEndDate;
    return date >= start && date <= end;
  };

  const getDragBackgroundColor = (date, selected) => {
    if (!isInDragRange(date)) return null;
    if (dragMode === "select" && !selected) return "#d9fbe2";
    if (dragMode === "unselect" && selected) return "#f8caca";
    return null;
  };

  return (
    <MKBox maxWidth="xl" mx="auto" p={3}>
      <MKTypography variant="h4" textAlign="center" mb={3}>
        Availability
      </MKTypography>

      {error && (
        <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError(null)}>
          <AlertTitle>Date selection error</AlertTitle>
          {error}
        </Alert>
      )}

      <MKBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MKButton variant="outlined" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
          ‹ Prev
        </MKButton>
        <MKTypography variant="h6">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </MKTypography>
        <MKButton variant="outlined" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
          Next ›
        </MKButton>
      </MKBox>

      <Grid container spacing={1} mb={1}>
        {daysOfWeek.map((day) => (
          <Grid item xs={1.7} key={day}>
            <MKTypography variant="body2" textAlign="center" fontWeight="medium">
              {day}
            </MKTypography>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1}>
        {[...Array(firstDay)].map((_, i) => (
          <Grid item xs={1.7} key={`pad-${i}`} />
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const date = new Date(year, month, i + 1);
          const blockedDay = isBlocked(date);
          const dateKey = date.toISOString().split("T")[0];
          const dragColor = getDragBackgroundColor(date, selectedDates[dateKey]);

          return (
            <Grid item xs={1.7} key={i}>
              <MKBox
                onMouseDown={() => handleMouseDown(date)}
                onMouseEnter={() => handleMouseEnter(date)}
                onMouseUp={handleMouseUp}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                sx={{
                  userSelect: "none",
                  height: 60,
                  borderRadius: 2,
                  backgroundColor: blockedDay
                    ? "grey.300"
                    : dragColor
                    ? dragColor
                    : selectedDates[dateKey]
                    ? "#81e59a"
                    : "white",
                  color: blockedDay ? "text.disabled" : "text.primary",
                  border: blockedDay ? "1px solid grey" : "1px solid #e0e0e0",
                  cursor: blockedDay ? "not-allowed" : "pointer",
                  "&:hover": { backgroundColor: blockedDay || dragColor ? undefined : "#b6f0c0" },
                }}
              >
                {i + 1}
                {!blockedDay && (
                  <MKTypography variant="caption" mt={0.5}>
                    €{getPriceForDate(date).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </MKTypography>
                )}
              </MKBox>
            </Grid>
          );
        })}
      </Grid>
    </MKBox>
  );
}

AvailabilityCalendar.propTypes = {
  icsUrls: PropTypes.arrayOf(
    PropTypes.shape({ url: PropTypes.string.isRequired, name: PropTypes.string.isRequired })
  ).isRequired,
  onSelectionChange: PropTypes.func, // callback to parent
};
