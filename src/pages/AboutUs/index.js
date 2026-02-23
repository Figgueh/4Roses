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

// @mui material components
import Card from "@mui/material/Card";

// Material Kit 2 React components
import MKBox from "components/MKBox";

// Material Kit 2 React examples
import DefaultNavbar from "components/DefaultNavbar";

// Author page sections
import Profile from "pages/AboutUs/sections/Profile";
import Contact from "pages/AboutUs/sections/Contact";
// import Footer from "pages/AboutUs/sections/Footer";
import CenteredFooter from "components/Footers/CenteredFooter";

// Routes
import { routes } from "routes";
import { useTranslation } from "react-i18next";

// Images
import bgImage from "assets/images/beach/beach1.jpg";
function AboutUs() {
  const { t } = useTranslation();
  const translatedRoutes = routes(t);
  return (
    <>
      <DefaultNavbar
        routes={translatedRoutes}
        action={{
          type: "external",
          route: "https://www.vrbo.com/en-ca/cottage-rental/p2905236vb",
          label: t("book"),
          color: "info",
        }}
        transparent
        light
      />
      <MKBox bgColor="white">
        <MKBox
          minHeight="35rem"
          width="100%"
          sx={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "grid",
            placeItems: "center",
          }}
        />
        <Card
          sx={{
            p: 2,
            mx: { xs: 2, lg: 3 },
            mt: -8,
            mb: 4,
            backgroundColor: ({ palette: { white }, functions: { rgba } }) => rgba(white.main, 0.8),
            backdropFilter: "saturate(200%) blur(30px)",
            boxShadow: ({ boxShadows: { xxl } }) => xxl,
          }}
        >
          <Profile />
        </Card>
        <Contact />
        <CenteredFooter />
      </MKBox>
    </>
  );
}

export default AboutUs;
