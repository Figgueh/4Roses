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
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

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

import axios from "axios";

function BaseLayout({ breadcrumb, title, children }) {
  const { section } = useParams();
  const [translation, setTranslation] = useState("");
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  useEffect(() => {
    const fetchData = async () => {
      if (i18n.language != "en") {
        const activityRes = await axios.get(`${process.env.REACT_APP_BACKEND}/activities/${title}`);
        const activityId = activityRes.data.id;

        // Only load the translation if it is for the activities.
        if (activityId) {
          const transRequest = await axios.get(
            `${process.env.REACT_APP_BACKEND}/activities/translation/${activityId}?lang=${i18n.language}`
          );
          setTranslation(transRequest.data.title);
        } else {
          setTranslation(title);
        }
      }
    };
    fetchData();
    console.log(section);
  }, [i18n.language]);

  return (
    <MKBox display="flex" flexDirection="column" bgColor="white" minHeight="100vh">
      <MKBox bgColor="white" shadow="sm" py={0.25}>
        <DefaultNavbar
          routes={translatedRoutes}
          action={{
            type: "internal",
            route: "/book",
            label: `${t("book")}`,
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
            {translation || title}
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
