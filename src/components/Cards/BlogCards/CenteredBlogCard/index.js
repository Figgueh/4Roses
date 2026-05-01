import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import MuiLink from "@mui/material/Link";

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

function CenteredBlogCard({ image, title, description, action }) {
  const imageProps =
    action.type === "external"
      ? {
          component: MuiLink,
          href: action.route,
          target: "_blank",
          rel: "noreferrer",
        }
      : {
          component: Link,
          to: action.route,
        };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MKBox
        {...imageProps}
        position="relative"
        borderRadius="lg"
        mx={2}
        mt={-3}
        display="block"
        sx={{ textDecoration: "none" }}
      >
        <MKBox
          component="img"
          src={image}
          alt={title}
          borderRadius="lg"
          width="100%"
          position="relative"
          zIndex={1}
        />
        <MKBox
          borderRadius="lg"
          shadow="md"
          width="100%"
          height="100%"
          position="absolute"
          left={0}
          top={0}
          sx={{
            backgroundImage: `url(${image})`,
            transform: "scale(0.94)",
            filter: "blur(12px)",
            backgroundSize: "cover",
          }}
        />
      </MKBox>

      <MKBox
        p={3}
        mt={-1}
        textAlign="center"
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <MKTypography display="inline" variant="h5" textTransform="capitalize" fontWeight="regular">
          {title}
        </MKTypography>

        <MKBox mt={1} mb={3}>
          <MKTypography variant="body2" component="p" color="text">
            {description}
          </MKTypography>
        </MKBox>

        <MKBox mt="auto" display="flex" justifyContent="center">
          <MKButton
            component={action.type === "external" ? MuiLink : Link}
            to={action.type === "internal" ? action.route : undefined}
            href={action.type === "external" ? action.route : undefined}
            target={action.type === "external" ? "_blank" : undefined}
            rel={action.type === "external" ? "noreferrer" : undefined}
            variant="gradient"
            size="small"
            color={action.color || "dark"}
            sx={{ maxWidth: 250, width: "100%" }}
          >
            {action.label}
          </MKButton>
        </MKBox>
      </MKBox>
    </Card>
  );
}

CenteredBlogCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal"]).isRequired,
    route: PropTypes.string.isRequired,
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
      "brown",
    ]),
    label: PropTypes.string.isRequired,
  }).isRequired,
};

export default CenteredBlogCard;
