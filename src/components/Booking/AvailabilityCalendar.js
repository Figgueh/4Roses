import { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import { Alert, AlertTitle } from "@mui/material";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function fetchICSFromBackend(url) {
  const backendUrl = `${process.env.REACT_APP_BACKEND}/bookings/ics?url=${encodeURIComponent(url)}`;
  const response = await fetch(backendUrl);
  if (!response.ok) throw new Error(`Failed to fetch ICS: ${response.status}`);
  return response.text();
}

// Parse ICS and keep the source name included
function parseICS(data, sourceName) {
  const events = data.split("BEGIN:VEVENT").slice(1);
  return events
    .map((event) => {
      const start = event.match(/DTSTART;VALUE=DATE:(\d{8})/)?.[1];
      const end = event.match(/DTEND;VALUE=DATE:(\d{8})/)?.[1];
      if (!start || !end) return null;
      // create plain Date objects (no time)
      const s = new Date(
        Number(start.slice(0, 4)),
        Number(start.slice(4, 6)) - 1,
        Number(start.slice(6, 8))
      );
      const e = new Date(
        Number(end.slice(0, 4)),
        Number(end.slice(4, 6)) - 1,
        Number(end.slice(6, 8))
      );
      return {
        start: s,
        end: e,
        source: sourceName,
      };
    })
    .filter(Boolean);
}

export default function AvailabilityCalendar({ icsUrls, selectedDates, onSelectionChange }) {
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [dragEndDate, setDragEndDate] = useState(null);
  const [dragMode, setDragMode] = useState(null);
  const [monthlyPrices, setMonthlyPrices] = useState({});
  const [error, setError] = useState("");
  const cancelRef = useRef(false);

  // Load monthly prices
  useEffect(() => {
    let mounted = true;
    fetch(`${process.env.REACT_APP_BACKEND}/billings/monthlyPrice`)
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setMonthlyPrices(data || {});
      })
      .catch((e) => {
        console.error("failed to fetch monthly prices", e);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    cancelRef.current = false;
    const load = async () => {
      if (!icsUrls || !icsUrls.length) return;
      try {
        const parsed = await Promise.all(
          icsUrls.map((source) =>
            fetchICSFromBackend(source.url).then((text) => parseICS(text, source.name))
          )
        );

        if (cancelRef.current) return;

        const allEvents = parsed.flat();
        const set = new Set();

        allEvents.forEach((event) => {
          // clone start to avoid mutating the parsed objects
          let d = new Date(event.start.getTime());
          while (d <= event.end) {
            const iso = d.toISOString().split("T")[0];

            set.add(
              JSON.stringify({
                date: iso,
                source: event.source,
              })
            );

            d = new Date(d.getTime());
            d.setDate(d.getDate() + 1);
          }
        });

        if (!cancelRef.current) setBlockedDates(set);
      } catch (err) {
        if (!cancelRef.current) console.error("Failed to load ICS calendars:", err);
      }
    };

    load();

    return () => {
      cancelRef.current = true;
    };
  }, [icsUrls]);

  // derive a fast lookup Map from the Set so we don't JSON.parse inside render loops
  const blockedSources = useMemo(() => {
    const map = new Map(); // date -> source string (last writer wins)
    for (const item of blockedDates) {
      try {
        const obj = JSON.parse(item);
        if (obj && obj.date) map.set(obj.date, obj.source || "");
      } catch (e) {
        // ignore
      }
    }
    return map;
  }, [blockedDates]);

  const isBlocked = (date) => {
    const iso = date.toISOString().split("T")[0];
    return blockedSources.has(iso);
  };

  const getSourceForDate = (date) => {
    const iso = date.toISOString().split("T")[0];
    return blockedSources.get(iso) || null;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getPriceForDate = (date) => monthlyPrices[date.getMonth()] ?? "--";

  // helpers - don't mutate passed Date objects
  const cloneDate = (d) => new Date(d.getTime());

  // Drag selection
  const handleMouseDown = (date) => {
    if (isBlocked(date) || isPastDate(date)) return;

    const key = date.toISOString().split("T")[0];
    setDragMode(selectedDates && selectedDates[key] ? "unselect" : "select");
    setIsDragging(true);
    setDragStartDate(cloneDate(date));
    setDragEndDate(cloneDate(date));
  };

  const handleMouseEnter = (date) => {
    if (isDragging && !isBlocked(date) && !isPastDate(date)) {
      setDragEndDate(cloneDate(date));
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStartDate || !dragEndDate) {
      // reset safely
      setIsDragging(false);
      setDragStartDate(null);
      setDragEndDate(null);
      setDragMode(null);
      return;
    }

    const start = dragStartDate < dragEndDate ? cloneDate(dragStartDate) : cloneDate(dragEndDate);
    const end = dragStartDate > dragEndDate ? cloneDate(dragStartDate) : cloneDate(dragEndDate);

    const newSelected = { ...(selectedDates || {}) };

    for (let d = cloneDate(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (isPastDate(d)) continue;

      const key = d.toISOString().split("T")[0];

      if (isBlocked(d)) continue;

      if (dragMode === "select") newSelected[key] = getPriceForDate(d);
      if (dragMode === "unselect") delete newSelected[key];
    }

    if (!validateContinuousDates(newSelected)) {
      setError("Selected dates must be continuous!");
    } else {
      onSelectionChange?.(newSelected);
      setError("");
    }

    setIsDragging(false);
    setDragStartDate(null);
    setDragEndDate(null);
    setDragMode(null);
  };

  function validateContinuousDates(dates) {
    const keys = Object.keys(dates).sort();
    if (keys.length === 0) return true;
    for (let i = 1; i < keys.length; i++) {
      const prev = new Date(keys[i - 1]);
      const curr = new Date(keys[i]);
      if ((curr - prev) / 86400000 !== 1) return false;
    }
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = (date) => {
    const d = cloneDate(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

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
        <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError("")}>
          <AlertTitle>Date selection error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Month controls */}
      <MKBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MKButton variant="contained" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
          ‹ Prev
        </MKButton>
        <MKTypography variant="h6">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </MKTypography>
        <MKButton variant="contained" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
          Next ›
        </MKButton>
      </MKBox>

      {/* Day headers */}
      <Grid container spacing={1} mb={1}>
        {daysOfWeek.map((day) => (
          <Grid item xs={1.7} key={day}>
            <MKTypography variant="body2" textAlign="center" fontWeight="medium">
              {day}
            </MKTypography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar grid */}
      <Grid container spacing={1}>
        {[...Array(firstDay)].map((_, i) => (
          <Grid item xs={1.7} key={`pad-${i}`} />
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const date = new Date(year, month, i + 1);
          const dateKey = date.toISOString().split("T")[0];

          const blockedDay = isBlocked(date);
          const sourceName = getSourceForDate(date);
          const pastDay = isPastDate(date);
          const dragColor = getDragBackgroundColor(date, selectedDates && selectedDates[dateKey]);

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
                  height: 64,
                  borderRadius: 2,
                  backgroundColor:
                    blockedDay || pastDay
                      ? "grey.200"
                      : dragColor
                      ? dragColor
                      : selectedDates && selectedDates[dateKey]
                      ? "#81e59a"
                      : "white",
                  color: blockedDay || pastDay ? "text.disabled" : "text.primary",
                  border: blockedDay || pastDay ? "1px solid #ccc" : "1px solid #e0e0e0",
                  cursor: blockedDay || pastDay ? "not-allowed" : "pointer",
                  "&:hover": {
                    backgroundColor: blockedDay || dragColor || pastDay ? undefined : "#b6f0c0",
                  },
                }}
              >
                <div>{i + 1}</div>

                {!blockedDay && !pastDay && (
                  <MKTypography variant="caption" mt={0.5}>
                    €
                    {getPriceForDate(date).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </MKTypography>
                )}

                {blockedDay && sourceName && (
                  <MKTypography
                    variant="caption"
                    mt={0.5}
                    sx={{ fontSize: "0.65rem", color: "#555" }}
                  >
                    {sourceName}
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
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedDates: PropTypes.objectOf(PropTypes.number),
  onSelectionChange: PropTypes.func,
};
