import React from "react";
import { keyframes } from "@mui/system";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.85); }
`;

const drift = keyframes`
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

export default function LoadingScreen({ message = "Loading…", fullScreen = true }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: fullScreen ? "100vh" : "50vh",
        background: fullScreen
          ? "linear-gradient(160deg, #fdf8f3 0%, #f5ede0 100%)"
          : "transparent",
        gap: 3,
        animation: `${fadeIn} 0.4s ease both`,
      }}
    >
      {/* Petals / dots */}
      <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              width: i === 2 ? 14 : i === 1 || i === 3 ? 10 : 7,
              height: i === 2 ? 14 : i === 1 || i === 3 ? 10 : 7,
              borderRadius: "50%",
              background: i === 2 ? "#8b4513" : i === 1 || i === 3 ? "#b5733a" : "#d4a574",
              animation: `${pulse} 1.4s ease-in-out ${i * 0.15}s infinite,
                           ${drift} 2.2s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </Box>

      {/* Rose icon */}
      <Box
        sx={{
          fontSize: "2.2rem",
          lineHeight: 1,
          animation: `${drift} 3s ease-in-out infinite`,
          filter: "drop-shadow(0 2px 6px rgba(139,69,19,0.18))",
        }}
      >
        🌹
      </Box>

      {/* Message */}
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.15rem",
            color: "#8b4513",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          {message}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mt: 0.75 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#c4956a",
                animation: `${pulse} 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

LoadingScreen.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
};
LoadingScreen.defaultProps = {
  message: "Loading…",
  fullScreen: true,
};
