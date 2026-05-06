/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import { UserAuth } from "connection/auth/authContext";
import { Alert, AlertTitle, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

async function fetchICSFromBackend(url) {
  const backendUrl = `${process.env.REACT_APP_BACKEND}/bookings/ics?url=${encodeURIComponent(url)}`;
  const response = await fetch(backendUrl);
  if (!response.ok) throw new Error(`Failed to fetch ICS: ${response.status}`);
  return response.text();
}

function parseICS(data, sourceName) {
  const events = data.split("BEGIN:VEVENT").slice(1);
  return events
    .map((event) => {
      const start = event.match(/DTSTART;VALUE=DATE:(\d{8})/)?.[1];
      const end = event.match(/DTEND;VALUE=DATE:(\d{8})/)?.[1];
      if (!start || !end) return null;
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
      return { start: s, end: e, source: sourceName };
    })
    .filter(Boolean);
}

export default function AvailabilityCalendar({
  icsUrls,
  selectedDates,
  onSelectionChange,
  isContinuousCheck,
  currentDate: controlledDate,
  onMonthChange,
}) {
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [blockedDates, setBlockedDates] = useState(new Set());
  const [internalDate, setInternalDate] = useState(new Date());
  const [priceOverrides, setPriceOverrides] = useState([]);
  const [monthlyPrices, setMonthlyPrices] = useState({});
  const [error, setError] = useState("");

  // ── Mobile: two-tap selection ────────────────────────────────────
  const [firstDate, setFirstDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  // ── Desktop: drag selection ──────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [dragEndDate, setDragEndDate] = useState(null);
  const [dragMode, setDragMode] = useState(null);
  // Refs so mouse handlers never go stale
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef(null);
  const dragEndRef = useRef(null);
  const dragModeRef = useRef(null);
  const selectedDatesRef = useRef(selectedDates);
  useEffect(() => {
    selectedDatesRef.current = selectedDates;
  }, [selectedDates]);

  const cancelRef = useRef(false);

  // Header swipe refs (mobile)
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const SWIPE_THRESHOLD = 50;

  const { session } = UserAuth();
  const accountId = session?.user?.id ?? null;

  const currentDate = controlledDate ?? internalDate;
  const setCurrentDate = useCallback(
    (d) => {
      if (onMonthChange) onMonthChange(d);
      else setInternalDate(d);
    },
    [onMonthChange]
  );

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch(`${process.env.REACT_APP_BACKEND}/billings/monthlyPrice`).then((r) => r.json()),
      fetch(`${process.env.REACT_APP_BACKEND}/billings/priceOverrides`).then((r) => r.json()),
    ])
      .then(([monthly, overrides]) => {
        if (mounted) {
          setMonthlyPrices(monthly || {});
          setPriceOverrides(overrides || []);
        }
      })
      .catch((e) => console.error("failed to fetch pricing", e));
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
          let d = new Date(event.start.getTime());
          while (d <= event.end) {
            const iso = d.toISOString().split("T")[0];
            set.add(JSON.stringify({ date: iso, source: event.source }));
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

  const blockedSources = useMemo(() => {
    const map = new Map();
    for (const item of blockedDates) {
      try {
        const obj = JSON.parse(item);
        if (obj && obj.date) map.set(obj.date, obj.source || "");
      } catch (e) {
        /* ignore */
      }
    }
    return map;
  }, [blockedDates]);

  const isBlocked = (date) => blockedSources.has(date.toISOString().split("T")[0]);
  const getSourceForDate = (date) => blockedSources.get(date.toISOString().split("T")[0]) || null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isPastDate = useCallback((date) => {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    return d < TODAY;
  }, []);

  const getPriceForDate = useCallback(
    (date) => {
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;
      const acct = priceOverrides.find(
        (o) => iso >= o.start_date && iso <= o.end_date && o.account_id === accountId
      );
      if (acct) return acct.price_per_night;
      const global = priceOverrides.find(
        (o) => iso >= o.start_date && iso <= o.end_date && o.account_id === null
      );
      if (global) return global.price_per_night;
      return monthlyPrices[date.getMonth()] ?? "--";
    },
    [priceOverrides, monthlyPrices, accountId]
  );

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

  // ── Mobile: two-tap logic ────────────────────────────────────────
  const handleDateTap = useCallback(
    (date) => {
      if (isBlocked(date) || isPastDate(date)) return;
      const dateKey = date.toISOString().split("T")[0];

      if (!firstDate) {
        setFirstDate(date);
        setError("");
        return;
      }

      if (firstDate.toISOString().split("T")[0] === dateKey) {
        setFirstDate(null);
        setHoverDate(null);
        return;
      }

      const start = firstDate < date ? new Date(firstDate.getTime()) : new Date(date.getTime());
      const end = firstDate > date ? new Date(firstDate.getTime()) : new Date(date.getTime());

      for (let d = new Date(start.getTime()); d <= end; d.setDate(d.getDate() + 1)) {
        if (isBlocked(d)) {
          setError(
            t("Your selection contains unavailable dates. Please choose a different range.")
          );
          setFirstDate(null);
          setHoverDate(null);
          return;
        }
      }

      const newSelected = {};
      for (let d = new Date(start.getTime()); d <= end; d.setDate(d.getDate() + 1)) {
        if (isPastDate(d)) continue;
        const key = d.toISOString().split("T")[0];
        newSelected[key] = getPriceForDate(d);
      }

      if (!validateContinuousDates(newSelected) && isContinuousCheck) {
        setError(t("Selected dates must be continuous!"));
      } else {
        onSelectionChange?.(newSelected);
        setError("");
      }

      setFirstDate(null);
      setHoverDate(null);
    },
    [
      firstDate,
      isPastDate,
      getPriceForDate,
      isContinuousCheck,
      onSelectionChange,
      t,
      blockedSources,
    ]
  );

  const handleClearSelection = () => {
    onSelectionChange?.({});
    setFirstDate(null);
    setHoverDate(null);
    setError("");
  };

  // ── Mobile: preview range ────────────────────────────────────────
  const isInPreviewRange = useCallback(
    (date) => {
      if (!firstDate || !hoverDate) return false;
      const start = firstDate < hoverDate ? firstDate : hoverDate;
      const end = firstDate > hoverDate ? firstDate : hoverDate;
      return date >= start && date <= end;
    },
    [firstDate, hoverDate]
  );

  const previewContainsBlocked = useMemo(() => {
    if (!firstDate || !hoverDate) return false;
    const start = firstDate < hoverDate ? firstDate : hoverDate;
    const end = firstDate > hoverDate ? firstDate : hoverDate;
    for (let d = new Date(start.getTime()); d <= end; d.setDate(d.getDate() + 1)) {
      if (isBlocked(d)) return true;
    }
    return false;
  }, [firstDate, hoverDate, blockedSources]);

  // ── Desktop: drag logic ──────────────────────────────────────────
  const commitDragSelection = useCallback(
    (startDate, endDate, mode) => {
      if (!startDate || !endDate) return;
      const start =
        startDate < endDate ? new Date(startDate.getTime()) : new Date(endDate.getTime());
      const end = startDate > endDate ? new Date(startDate.getTime()) : new Date(endDate.getTime());
      const newSelected = { ...(selectedDatesRef.current || {}) };
      for (let d = new Date(start.getTime()); d <= end; d.setDate(d.getDate() + 1)) {
        if (isPastDate(d) || isBlocked(d)) continue;
        const key = d.toISOString().split("T")[0];
        if (mode === "select") newSelected[key] = getPriceForDate(d);
        if (mode === "unselect") delete newSelected[key];
      }
      if (!validateContinuousDates(newSelected) && isContinuousCheck) {
        setError(t("Selected dates must be continuous!"));
      } else {
        onSelectionChange?.(newSelected);
        setError("");
      }
    },
    [isPastDate, getPriceForDate, isContinuousCheck, onSelectionChange, t, blockedSources]
  );

  const resetDrag = useCallback(() => {
    setIsDragging(false);
    setDragStartDate(null);
    setDragEndDate(null);
    setDragMode(null);
    isDraggingRef.current = false;
    dragStartRef.current = null;
    dragEndRef.current = null;
    dragModeRef.current = null;
  }, []);

  const handleMouseDown = (date) => {
    if (isBlocked(date) || isPastDate(date)) return;
    const key = date.toISOString().split("T")[0];
    const mode = selectedDatesRef.current?.[key] ? "unselect" : "select";
    const cloned = new Date(date.getTime());
    isDraggingRef.current = true;
    dragModeRef.current = mode;
    dragStartRef.current = cloned;
    dragEndRef.current = cloned;
    setIsDragging(true);
    setDragMode(mode);
    setDragStartDate(cloned);
    setDragEndDate(cloned);
  };

  const handleMouseEnter = (date) => {
    if (!isDraggingRef.current || isBlocked(date) || isPastDate(date)) return;
    const cloned = new Date(date.getTime());
    dragEndRef.current = cloned;
    setDragEndDate(cloned);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    if (dragStartRef.current && dragEndRef.current) {
      commitDragSelection(dragStartRef.current, dragEndRef.current, dragModeRef.current);
    }
    resetDrag();
  };

  const isInDragRange = (date) => {
    if (!isDragging || !dragStartDate || !dragEndDate) return false;
    const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
    const end = dragStartDate > dragEndDate ? dragStartDate : dragEndDate;
    return date >= start && date <= end;
  };

  const getDragBg = (date, selected) => {
    if (!isInDragRange(date)) return null;
    if (dragMode === "select" && !selected) return "#d9fbe2";
    if (dragMode === "unselect" && selected) return "#f8caca";
    return null;
  };

  // ── Mobile cell appearance ───────────────────────────────────────
  const getMobileCellState = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    const blocked = isBlocked(date);
    const past = isPastDate(date);
    const selected = !!(selectedDates && selectedDates[dateKey]);
    const isFirst = !!(firstDate && firstDate.toISOString().split("T")[0] === dateKey);
    const inPreview = !blocked && !past && isInPreviewRange(date);
    const invalid = inPreview && previewContainsBlocked;
    return { dateKey, blocked, past, selected, isFirst, inPreview, invalid };
  };

  const getMobileBg = ({ blocked, past, selected, isFirst, inPreview, invalid }) => {
    if (blocked || past) return "#efefef";
    if (isFirst) return "#4caf7d";
    if (inPreview) return invalid ? "#fde8e8" : "#d9fbe2";
    if (selected) return "#81e59a";
    return "#fff";
  };

  const getMobileBorder = ({ blocked, past, selected, isFirst, inPreview, invalid }) => {
    if (isFirst) return "2px solid #2e7d52";
    if (inPreview && !invalid) return "1px solid #81e59a";
    if (inPreview && invalid) return "1px solid #f5b7b1";
    if (selected) return "2px solid #3dba60";
    if (blocked || past) return "1px solid #ddd";
    return "1px solid #e8e8e8";
  };

  // ── Header touch (swipe month — mobile only) ─────────────────────
  const handleHeaderTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleHeaderTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - (touchStartX.current ?? 0);
    const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setCurrentDate(new Date(year, month + (dx < 0 ? 1 : -1), 1));
    }
  };

  // ── Mobile day cell ──────────────────────────────────────────────
  const MobileDayCell = ({ date, dateKey, blockedDay, sourceName, pastDay }) => {
    const state = getMobileCellState(date);
    const price = !blockedDay && !pastDay ? getPriceForDate(date) : null;
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
    const hasOverride =
      price !== null &&
      priceOverrides.some((o) => {
        if (!(iso >= o.start_date && iso <= o.end_date)) return false;
        if (o.account_id !== null && o.account_id !== accountId) return false;
        return o.price_per_night !== (monthlyPrices[date.getMonth()] ?? "--");
      });

    return (
      <div
        data-date={dateKey}
        onClick={() => handleDateTap(date)}
        onMouseEnter={() => firstDate && !blockedDay && !pastDay && setHoverDate(date)}
        onMouseLeave={() => setHoverDate(null)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 52,
          borderRadius: 10,
          backgroundColor: getMobileBg(state),
          border: getMobileBorder(state),
          cursor: blockedDay || pastDay ? "not-allowed" : "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
          position: "relative",
          gap: 1,
          transition: "background-color 0.1s ease, border-color 0.1s ease",
        }}
      >
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: state.isFirst || state.selected ? 700 : 500,
            color:
              blockedDay || pastDay
                ? "#bbb"
                : state.isFirst
                ? "#fff"
                : state.selected
                ? "#1a6e35"
                : "#222",
            lineHeight: 1,
          }}
        >
          {date.getDate()}
        </span>

        {price !== null && (
          <span
            style={{
              fontSize: "0.58rem",
              color: state.isFirst ? "#e8f5ee" : state.selected ? "#1a6e35" : "#666",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            €
            {typeof price === "number"
              ? price.toLocaleString(undefined, { minimumFractionDigits: 0 })
              : price}
          </span>
        )}

        {hasOverride && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: state.isFirst ? "#fff" : "#8b4513",
            }}
          />
        )}

        {blockedDay && sourceName && (
          <span
            style={{
              fontSize: "0.5rem",
              color: "#999",
              lineHeight: 1,
              textAlign: "center",
              padding: "0 2px",
            }}
          >
            {sourceName}
          </span>
        )}
      </div>
    );
  };

  MobileDayCell.propTypes = {
    date: (props, propName, componentName) => {
      const val = props[propName];
      if (!(val instanceof Date) || isNaN(val.getTime())) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected a valid Date instance.`
        );
      }
      return null;
    },
    dateKey: PropTypes.string.isRequired,
    blockedDay: PropTypes.bool.isRequired,
    sourceName: PropTypes.string,
    pastDay: PropTypes.bool.isRequired,
  };
  MobileDayCell.defaultProps = { sourceName: null };

  const selectedCount = selectedDates ? Object.keys(selectedDates).length : 0;

  return (
    <MKBox
      maxWidth={isMobile ? "100%" : "xl"}
      mx="auto"
      p={isMobile ? 0 : 3}
      sx={
        isMobile
          ? { width: "100vw", position: "relative", left: "50%", transform: "translateX(-50%)" }
          : {}
      }
    >
      <MKTypography
        variant="h4"
        textAlign="center"
        mb={isMobile ? 0 : 3}
        sx={isMobile ? { pt: 2, pb: 1 } : {}}
      >
        {t("Availability")}
      </MKTypography>

      {/* Mobile-only status banners */}
      {isMobile && firstDate && (
        <Alert
          severity="info"
          sx={{ mx: 1, mb: 1 }}
          onClose={() => {
            setFirstDate(null);
            setHoverDate(null);
          }}
        >
          {t("Start date selected")}: <strong>{firstDate.toLocaleDateString(i18n.language)}</strong>
          . <br></br>{" "}
          {t("Now tap an end date. All dates in between will be selected automatically.")}
        </Alert>
      )}

      {error && (
        <Alert sx={{ mt: 1, mx: isMobile ? 1 : 0 }} severity="error" onClose={() => setError("")}>
          <AlertTitle>{t("Date selection error")}</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Month controls */}
      {isMobile ? (
        <MKBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onTouchStart={handleHeaderTouchStart}
          onTouchEnd={handleHeaderTouchEnd}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "white",
            py: 1,
            px: 1.5,
            borderBottom: "1px solid #f0f0f0",
            mb: 1,
          }}
        >
          <MKButton
            variant="contained"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            sx={{ minWidth: 44, minHeight: 44, px: 1.5, fontSize: "1.2rem" }}
          >
            ‹
          </MKButton>
          <MKTypography variant="h6" sx={{ userSelect: "none" }}>
            {currentDate.toLocaleString(i18n.language, { month: "long", year: "numeric" })}
          </MKTypography>
          <MKButton
            variant="contained"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            sx={{ minWidth: 44, minHeight: 44, px: 1.5, fontSize: "1.2rem" }}
          >
            ›
          </MKButton>
        </MKBox>
      ) : (
        <MKBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MKButton
            variant="contained"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            ‹ {t("Previous")}
          </MKButton>
          <MKTypography variant="h6">
            {currentDate.toLocaleString(i18n.language, { month: "long", year: "numeric" })}
          </MKTypography>
          <MKButton
            variant="contained"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
            {t("Next")} ›
          </MKButton>
        </MKBox>
      )}

      {/* Mobile-only: selected nights summary + clear */}
      {isMobile && selectedCount > 0 && !firstDate && (
        <MKBox
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mx: 1,
            mb: 1,
            px: 1.5,
            py: 0.75,
            background: "#f0faf3",
            border: "1px solid #a8dbb9",
            borderRadius: 2,
          }}
        >
          <MKTypography variant="caption" sx={{ color: "#1a6b3c" }}>
            {selectedCount} {t(selectedCount === 1 ? "night selected" : "nights selected")}
          </MKTypography>
          <MKButton
            size="small"
            variant="text"
            onClick={handleClearSelection}
            sx={{ color: "#c0392b", fontSize: "11px", minWidth: 0, p: 0.5 }}
          >
            {t("Clear")}
          </MKButton>
        </MKBox>
      )}

      {/* Desktop drag hint */}
      {!isMobile && (
        <MKTypography
          variant="caption"
          display="block"
          textAlign="center"
          mb={1}
          sx={{ color: "text.secondary", fontStyle: "italic" }}
        >
          {t("Click and hold to select continuous dates")}
        </MKTypography>
      )}

      {/* Day headers */}
      {isMobile ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            marginBottom: 4,
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          {daysOfWeek.map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#999",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                paddingBottom: 4,
              }}
            >
              {t(day).slice(0, 2)}
            </div>
          ))}
        </div>
      ) : (
        <Grid container spacing={1} mb={1}>
          {daysOfWeek.map((day) => (
            <Grid item xs={1.7} key={day}>
              <MKTypography variant="body2" textAlign="center" fontWeight="medium">
                {t(day)}
              </MKTypography>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Calendar grid */}
      {isMobile ? (
        // ── Mobile: tap-to-select ──────────────────────────────────
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            paddingLeft: 8,
            paddingRight: 8,
            paddingBottom: 16,
          }}
        >
          {[...Array(firstDay)].map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const date = new Date(year, month, i + 1);
            const dateKey = date.toISOString().split("T")[0];
            const blockedDay = isBlocked(date);
            const sourceName = getSourceForDate(date);
            const pastDay = isPastDate(date);
            return (
              <MobileDayCell
                key={dateKey}
                date={date}
                dateKey={dateKey}
                blockedDay={blockedDay}
                sourceName={sourceName}
                pastDay={pastDay}
              />
            );
          })}
        </div>
      ) : (
        // ── Desktop: original drag-to-select ──────────────────────
        <Grid container spacing={1} onMouseLeave={handleMouseUp}>
          {[...Array(firstDay)].map((_, i) => (
            <Grid item xs={1.7} key={`pad-${i}`} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const date = new Date(year, month, i + 1);
            const dateKey = date.toISOString().split("T")[0];
            const blockedDay = isBlocked(date);
            const sourceName = getSourceForDate(date);
            const pastDay = isPastDate(date);
            const selected = !!(selectedDates && selectedDates[dateKey]);
            const dragBg = getDragBg(date, selected);

            return (
              <Grid item xs={1.7} key={i}>
                <MKBox
                  data-date={dateKey}
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
                        : dragBg
                        ? dragBg
                        : selected
                        ? "#81e59a"
                        : "white",
                    color: blockedDay || pastDay ? "text.disabled" : "text.primary",
                    border: blockedDay || pastDay ? "1px solid #ccc" : "1px solid #e0e0e0",
                    cursor: blockedDay || pastDay ? "not-allowed" : "pointer",
                    "&:hover": {
                      backgroundColor: blockedDay || pastDay || dragBg ? undefined : "#b6f0c0",
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

                  {!blockedDay &&
                    !pastDay &&
                    (() => {
                      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      )}-${String(date.getDate()).padStart(2, "0")}`;
                      const hasOverride = priceOverrides.some((o) => {
                        if (!(iso >= o.start_date && iso <= o.end_date)) return false;
                        if (o.account_id !== null && o.account_id !== accountId) return false;
                        return o.price_per_night !== (monthlyPrices[date.getMonth()] ?? "--");
                      });
                      return hasOverride ? (
                        <div
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "#8b4513",
                            marginTop: 2,
                          }}
                        />
                      ) : null;
                    })()}

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
      )}
    </MKBox>
  );
}

AvailabilityCalendar.propTypes = {
  icsUrls: PropTypes.arrayOf(
    PropTypes.shape({ url: PropTypes.string.isRequired, name: PropTypes.string.isRequired })
  ).isRequired,
  selectedDates: PropTypes.objectOf(PropTypes.number),
  onSelectionChange: PropTypes.func,
  isContinuousCheck: PropTypes.bool,
  currentDate: PropTypes.instanceOf(Date),
  onMonthChange: PropTypes.func,
};

AvailabilityCalendar.defaultProps = {
  selectedDates: null,
  onSelectionChange: null,
  isContinuousCheck: false,
  currentDate: null,
  onMonthChange: null,
};
