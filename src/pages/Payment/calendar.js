import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";

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

const fetchPrice = async (date) => {
  const formatted = date.toISOString().split("T")[0];
  const res = await fetch(`${process.env.REACT_APP_BACKEND}/reservation/price?date=${formatted}`);
  if (!res.ok) return null;

  const data = await res.json(); // expects { price: 123 }
  return data.price;
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityCalendar({ icsUrls }) {
  const [blocked, setBlocked] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [dragEndDate, setDragEndDate] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!icsUrls || !icsUrls.length) return;
      try {
        const results = await Promise.all(
          icsUrls.map((s) => fetchICSFromBackend(s.url).then((text) => parseICS(text, s.name)))
        );
        setBlocked(results.flat());
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

  // const handleDateClick = async (date) => {
  //   const key = date.toISOString().split("T")[0];

  //   if (selectedDates[key]) {
  //     // unselect
  //     const updated = { ...selectedDates };
  //     delete updated[key];
  //     setSelectedDates(updated);
  //     return;
  //   }

  //   const price = await fetchPrice(date);

  //   setSelectedDates((prev) => ({
  //     ...prev,
  //     [key]: price,
  //   }));
  // };

  const getBlockedSources = (date) =>
    blocked.filter((b) => date >= b.start && date < b.end).map((b) => b.source);

  const changeMonth = (n) => setCurrentDate(new Date(year, month + n, 1));

  const handleMouseDown = (date) => {
    if (!getBlockedSources(date).length) {
      setIsDragging(true);
      setDragStartDate(date);
      setDragEndDate(date);
    }
  };

  const handleMouseEnter = (date) => {
    if (isDragging && !getBlockedSources(date).length) {
      setDragEndDate(date);
    }
  };

  const handleMouseUp = async () => {
    if (!dragStartDate || !dragEndDate) {
      setIsDragging(false);
      return;
    }

    // compute all dates in the range
    const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
    const end = dragStartDate > dragEndDate ? dragStartDate : dragEndDate;
    const newSelected = { ...selectedDates };

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      if (!newSelected[key] && !getBlockedSources(d).length) {
        const price = await fetchPrice(new Date(d)); // fetch price
        newSelected[key] = price;
      }
    }

    setSelectedDates(newSelected);
    setIsDragging(false);
    setDragStartDate(null);
    setDragEndDate(null);
  };

  return (
    <MKBox maxWidth="xl" mx="auto" p={3}>
      <MKTypography variant="h4" textAlign="center" mb={3}>
        Availability
      </MKTypography>

      <MKBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MKButton variant="outlined" onClick={() => changeMonth(-1)}>
          ‹ Prev
        </MKButton>
        <MKTypography variant="h6">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </MKTypography>
        <MKButton variant="outlined" onClick={() => changeMonth(1)}>
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
          const blockedSources = getBlockedSources(date);
          const blockedDay = blockedSources.length > 0;
          const dateKey = date.toISOString().split("T")[0];

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
                  height: 60,
                  borderRadius: 2,
                  backgroundColor: blockedDay
                    ? "grey.300"
                    : selectedDates[dateKey]
                    ? "#b6f0c0"
                    : "white",
                  color: blockedDay ? "text.disabled" : "text.primary",
                  border: blockedDay ? "1px solid grey" : "1px solid #e0e0e0",
                  cursor: blockedDay ? "not-allowed" : "pointer",
                  "&:hover": {
                    backgroundColor: blockedDay ? "grey.300" : "#b6f0c0",
                  },
                }}
              >
                {i + 1}
                {!blockedDay && selectedDates[dateKey] && (
                  <MKTypography variant="caption" mt={0.5}>
                    ${selectedDates[dateKey]}
                  </MKTypography>
                )}
              </MKBox>
            </Grid>
          );
        })}
      </Grid>

      <MKBox display="flex" gap={3} justifyContent="center" mt={3}>
        <MKBox display="flex" alignItems="center" gap={1}>
          <MKBox
            width={16}
            height={16}
            sx={{ bgcolor: "white", border: "1px solid #e0e0e0", borderRadius: 1 }}
          />
          <MKTypography variant="caption">Available</MKTypography>
        </MKBox>
        <MKBox display="flex" alignItems="center" gap={1}>
          <MKBox width={16} height={16} sx={{ bgcolor: "grey.300", borderRadius: 1 }} />
          <MKTypography variant="caption">Unavailable</MKTypography>
        </MKBox>
      </MKBox>
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
};
