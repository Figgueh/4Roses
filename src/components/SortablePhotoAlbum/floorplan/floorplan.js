import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { ImageSlide } from "yet-another-react-lightbox";
import { ReactComponent as FirstFloorPlan } from "assets/images/floorplan/first_floor.svg";
import { ReactComponent as SecondFloorPlan } from "assets/images/floorplan/second_floor.svg";
import { getFloorFromRoomId, getFloorLabel } from "utils";
import { ROOM_OPTIONS, getRoomColor, getRoomLabel } from "utils";

const DEFAULT_FILL = "#d9d9d9";
const DEFAULT_STROKE = "#000000";

const paintFloorSvg = (svg, activeRoomId) => {
  if (!svg) return;
  const allRooms = [...ROOM_OPTIONS.first, ...ROOM_OPTIONS.second];
  allRooms.forEach(({ value: roomId }) => {
    const el = svg.querySelector(`#${roomId}`);
    if (!el) return;
    const targets = el.tagName.toLowerCase() === "g" ? Array.from(el.children) : [el];
    targets.forEach((node) => {
      node.style.fill = DEFAULT_FILL;
      node.style.stroke = DEFAULT_STROKE;
      node.style.strokeWidth = "3";
      node.style.opacity = "0.7";
      node.style.transition = "fill 0.2s ease, opacity 0.2s ease";
    });
  });
  if (!activeRoomId) return;
  const active = svg.querySelector(`#${activeRoomId}`);
  if (!active) return;
  const targets = active.tagName.toLowerCase() === "g" ? Array.from(active.children) : [active];
  targets.forEach((node) => {
    node.style.fill = getRoomColor(activeRoomId) || DEFAULT_FILL;
    node.style.opacity = "1";
  });
};

const FloorPlanMap = ({ activeRoomId }) => {
  const wrapperRef = useRef(null);
  const floor = getFloorFromRoomId(activeRoomId);
  useEffect(() => {
    const svg = wrapperRef.current?.querySelector("svg");
    paintFloorSvg(svg, activeRoomId);
  }, [activeRoomId, floor]);
  return (
    <div ref={wrapperRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {floor === "second" ? (
        <SecondFloorPlan
          style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }}
        />
      ) : (
        <FirstFloorPlan
          style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }}
        />
      )}
    </div>
  );
};

FloorPlanMap.propTypes = {
  activeRoomId: PropTypes.string,
};

const FloorPlanSlide = ({ slide, offset, rect, showFloorPlan, setShowFloorPlan }) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const floorLabel = getFloorLabel(slide.roomId);
  const roomLabel = getRoomLabel(slide.roomId);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Floor plan panel — always in DOM, zero width when hidden */}
      {slide.roomId && (
        <div
          style={{
            width: showFloorPlan
              ? isMobile
                ? "min(140px, 38vw)"
                : "clamp(95px, 28vw, 220px)"
              : "0",
            flexShrink: 0,
            overflow: "hidden",
            transition: "width 0.2s ease",
            borderRight: showFloorPlan && !isMobile ? "1px solid rgba(255,255,255,0.1)" : "none",
            borderBottom: showFloorPlan && isMobile ? "1px solid rgba(255,255,255,0.1)" : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 6 : "clamp(6px, 1.5vw, 12px)",
            alignSelf: isMobile ? "flex-start" : "center",
            padding: showFloorPlan
              ? isMobile
                ? "8px 8px 4px 8px"
                : "clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px)"
              : "0",
          }}
        >
          {showFloorPlan && (
            <>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: isMobile ? 9 : "clamp(9px, 2vw, 11px)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Photo location
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {floorLabel}
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {roomLabel}
              </div>
              <FloorPlanMap activeRoomId={slide.roomId} />
            </>
          )}
        </div>
      )}

      {/* Image area */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <ImageSlide slide={slide} offset={offset} rect={rect} />

        {slide.roomId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFloorPlan((prev) => !prev);
            }}
            title={showFloorPlan ? "Hide floor plan" : "Show floor plan"}
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 100,
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              fontSize: 12,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            {showFloorPlan ? "Hide map" : "Show map"}
          </button>
        )}
      </div>
    </div>
  );
};

FloorPlanSlide.propTypes = {
  slide: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    roomId: PropTypes.string,
  }).isRequired,
  offset: PropTypes.number,
  rect: PropTypes.object,
  showFloorPlan: PropTypes.bool.isRequired,
  setShowFloorPlan: PropTypes.func.isRequired,
};

export default FloorPlanSlide;
