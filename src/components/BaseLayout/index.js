/*
=========================================================
* Material Kit 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Container from "@mui/material/Container";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Material Kit 2 React examples
import DefaultNavbar from "components/DefaultNavbar";
import CenteredFooter from "components/Footers/CenteredFooter";
import Breadcrumbs from "components/Breadcrumbs";

// Routes
import { routes } from "routes";
import { useTranslation } from "react-i18next";

function BaseLayout({ breadcrumb, title, children }) {
  const { t } = useTranslation();
  const translatedRoutes = routes(t);
  return (
    <MKBox display="flex" flexDirection="column" bgColor="white" minHeight="100vh">
      <MKBox bgColor="white" shadow="sm" py={0.25}>
        <DefaultNavbar
          routes={translatedRoutes}
          action={{
            type: "external",
            route: "https://www.vrbo.com/en-ca/cottage-rental/p2905236vb",
            label: "book today!",
            color: "info",
          }}
          transparent
          relative
        />
      </MKBox>
      {/* Main content grows to fill space */}
      <MKBox sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Container sx={{ mt: 6, flex: 1, display: "flex", flexDirection: "column" }}>
          <MKBox
            width={{ xs: "100%", md: "50%", lg: "35%" }}
            mb={3}
            sx={{ display: "flex", gap: 1 }}
          >
            {breadcrumb && <Breadcrumbs routes={breadcrumb} />}
          </MKBox>
          <MKTypography variant="h3" mb={1}>
            {title}
          </MKTypography>
          {/* This ensures children grow and allow footer push-down */}
          <MKBox sx={{ flex: 1 }}>{children}</MKBox>
        </Container>
      </MKBox>

      {/* Sticky footer */}
      <MKBox mt="auto">
        <CenteredFooter />
      </MKBox>
    </MKBox>
  );
}

// Typechecking props for the BaseLayout
BaseLayout.propTypes = {
  breadcrumb: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])),
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BaseLayout;
