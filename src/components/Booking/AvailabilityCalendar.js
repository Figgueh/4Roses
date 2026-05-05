/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import { UserAuth } from "connection/auth/authContext";
import { Alert, AlertTitle, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [dragEndDate, setDragEndDate] = useState(null);
  const [dragMode, setDragMode] = useState(null);
  const [priceOverrides, setPriceOverrides] = useState([]);
  const [monthlyPrices, setMonthlyPrices] = useState({});
  const [error, setError] = useState("");
  const cancelRef = useRef(false);

  // Touch / swipe refs
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const SWIPE_THRESHOLD = 50;

  const { session } = UserAuth();
  const accountId = session?.user?.id ?? null;

  const currentDate = controlledDate ?? internalDate;
  const setCurrentDate = (d) => {
    if (onMonthChange) onMonthChange(d);
    else setInternalDate(d);
  };

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

  const getPriceForDate = (date) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
    const accountOverride = priceOverrides.find(
      (o) => iso >= o.start_date && iso <= o.end_date && o.account_id === accountId
    );
    if (accountOverride) return accountOverride.price_per_night;
    const globalOverride = priceOverrides.find(
      (o) => iso >= o.start_date && iso <= o.end_date && o.account_id === null
    );
    if (globalOverride) return globalOverride.price_per_night;
    return monthlyPrices[date.getMonth()] ?? "--";
  };

  const cloneDate = (d) => new Date(d.getTime());

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

    if (!validateContinuousDates(newSelected) & isContinuousCheck) {
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

  // Touch handlers
  const handleTouchStart = (date, e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    if (isBlocked(date) || isPastDate(date)) return;
    const key = date.toISOString().split("T")[0];
    setDragMode(selectedDates?.[key] ? "unselect" : "select");
    setIsDragging(true);
    setDragStartDate(cloneDate(date));
    setDragEndDate(cloneDate(date));
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dateStr = el?.dataset?.date;
    if (dateStr) {
      const [y, mo, d] = dateStr.split("-").map(Number);
      const hovered = new Date(y, mo - 1, d);
      if (!isBlocked(hovered) && !isPastDate(hovered)) setDragEndDate(cloneDate(hovered));
    }
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - (touchStartX.current ?? 0);
    const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5 && !isDragging) {
      setCurrentDate(new Date(year, month + (dx < 0 ? 1 : -1), 1));
    } else if (isDragging && dragStartDate && dragEndDate) {
      handleMouseUp();
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

  // ── Mobile day cell ─────────────────────────────────────────────
  const MobileDayCell = ({ date, dateKey, blockedDay, sourceName, pastDay, dragColor }) => {
    const selected = selectedDates?.[dateKey];
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

    const bg = blockedDay || pastDay ? "#efefef" : dragColor || (selected ? "#81e59a" : "#fff");

    return (
      <div
        data-date={dateKey}
        onMouseDown={() => handleMouseDown(date)}
        onMouseEnter={() => handleMouseEnter(date)}
        onMouseUp={handleMouseUp}
        onTouchStart={(e) => handleTouchStart(date, e)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 52,
          borderRadius: 10,
          backgroundColor: bg,
          border:
            selected && !blockedDay && !pastDay
              ? "2px solid #3dba60"
              : blockedDay || pastDay
              ? "1px solid #ddd"
              : "1px solid #e8e8e8",
          cursor: blockedDay || pastDay ? "not-allowed" : "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: isDragging ? "none" : "pan-y",
          transition: "background-color 0.1s ease, transform 0.08s ease",
          position: "relative",
          gap: 1,
        }}
      >
        {/* Day number */}
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: selected && !blockedDay && !pastDay ? 700 : 500,
            color: blockedDay || pastDay ? "#bbb" : selected ? "#1a6e35" : "#222",
            lineHeight: 1,
          }}
        >
          {date.getDate()}
        </span>

        {/* Price */}
        {price !== null && (
          <span
            style={{
              fontSize: "0.58rem",
              color: selected ? "#1a6e35" : "#666",
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

        {/* Override dot */}
        {hasOverride && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#8b4513",
            }}
          />
        )}

        {/* Blocked source label */}
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

  return (
    <MKBox maxWidth="xl" mx="auto" p={isMobile ? 1.5 : 3}>
      <MKTypography variant="h4" textAlign="center" mb={isMobile ? 2 : 3}>
        {t("Availability")}
      </MKTypography>

      {error && (
        <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError("")}>
          <AlertTitle>{t("Date selection error")}</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Month controls */}
      <MKBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={isMobile ? 1.5 : 2}
        sx={
          isMobile
            ? {
                position: "sticky",
                top: 0,
                zIndex: 10,
                backgroundColor: "white",
                py: 1,
                px: 0.5,
                borderBottom: "1px solid #f0f0f0",
              }
            : {}
        }
      >
        <MKButton
          variant="contained"
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          sx={isMobile ? { minWidth: 44, minHeight: 44, px: 1.5, fontSize: "1.1rem" } : {}}
        >
          {isMobile ? "‹" : `‹ ${t("Previous")}`}
        </MKButton>

        <MKTypography variant="h6">
          {currentDate.toLocaleString(i18n.language, { month: "long", year: "numeric" })}
        </MKTypography>

        <MKButton
          variant="contained"
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          sx={isMobile ? { minWidth: 44, minHeight: 44, px: 1.5, fontSize: "1.1rem" } : {}}
        >
          {isMobile ? "›" : `${t("Next")} ›`}
        </MKButton>
      </MKBox>

      {/* Swipe hint — mobile only */}
      {isMobile && (
        <MKTypography
          variant="caption"
          display="block"
          textAlign="center"
          mb={1}
          sx={{ color: "text.secondary" }}
        >
          {t("Swipe left or right to change month")}
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
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
            const dragColor = getDragBackgroundColor(date, selectedDates?.[dateKey]);

            return (
              <MobileDayCell
                key={dateKey}
                date={date}
                dateKey={dateKey}
                blockedDay={blockedDay}
                sourceName={sourceName}
                pastDay={pastDay}
                dragColor={dragColor}
              />
            );
          })}
        </div>
      ) : (
        <Grid container spacing={1} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
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
                  data-date={dateKey}
                  onMouseDown={() => handleMouseDown(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                  onMouseUp={handleMouseUp}
                  onTouchStart={(e) => handleTouchStart(date, e)}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  sx={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    touchAction: isDragging ? "none" : "pan-y",
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
                        const basePrice = monthlyPrices[date.getMonth()] ?? "--";
                        return o.price_per_night !== basePrice;
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
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedDates: PropTypes.objectOf(PropTypes.number),
  onSelectionChange: PropTypes.func,
  isContinuousCheck: PropTypes.bool,
  currentDate: PropTypes.instanceOf(Date),
  onMonthChange: PropTypes.func,
};
