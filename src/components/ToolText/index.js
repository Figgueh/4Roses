import { useRef, useState, useEffect } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

import Tooltip from "@mui/material/Tooltip";
import MKTypography from "components/MKTypography";

function ToolText({ children }) {
  const textRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setShowTooltip(el.scrollWidth > el.clientWidth);
    }
  }, [children]);

  const text = (
    <MKTypography
      ref={textRef}
      variant="button"
      fontWeight="regular"
      textDecoration="none"
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: {
          xs: "200px",
          sm: "250px",
          md: "100px",
          lg: "100px",
          xl: "160px",
        },
        "@media (min-width: 1800px)": {
          maxWidth: "200px", // bigger than xl
        },
        display: "block",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      {children}
    </MKTypography>
  );

  return showTooltip ? (
    <Tooltip title={children} placement="top">
      {text}
    </Tooltip>
  ) : (
    text
  );
}

ToolText.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToolText;
