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
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Material Kit 2 React examples
import DefaultNavbar from "components/DefaultNavbar";
import DefaultFooter from "components/Footers/DefaultFooter";

// Routes
import { routes } from "routes";
import footerRoutes from "footer.routes";

//Images
import bgImage from "assets/images/property/exterior/frontGroundFloor.JPG";

// Home page sections
import MainFeatures from "pages/Home/sections/MainFeatures";
import Amenities from "pages/Home/sections/Amenities";
import MediaCard from "components/Cards/BlogCards/CenteredBlogCard/MediaCard";

import { useTranslation } from "react-i18next";

function Home() {
  const { t } = useTranslation();
  const translatedRoutes = routes(t);

  return (
    <>
      <DefaultNavbar
        routes={translatedRoutes}
        action={{
          type: "external",
          route: "https://www.vrbo.com/en-ca/cottage-rental/p2905236vb",
          label: `${t("book")}`,
          color: "default",
        }}
        sticky
      />

      <MKBox
        minHeight="75vh"
        width="100%"
        sx={{
          backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Container>
          <Grid
            container
            item
            xs={12}
            lg={8}
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            sx={{ mx: "auto", textAlign: "center" }}
          >
            <MKTypography
              variant="h1"
              color="white"
              sx={({ breakpoints, typography: { size } }) => ({
                [breakpoints.down("md")]: {
                  fontSize: size["3xl"],
                },
              })}
            >
              {t("dreamRental")}
            </MKTypography>
            <MKTypography variant="body1" color="white" opacity={0.8} mt={1} mb={3}>
              {t("Spacious, Scenic, and Ready for You — Book Today!")}
            </MKTypography>
          </Grid>
        </Container>
      </MKBox>
      <Card
        sx={{
          p: 2,
          mx: { xs: 2, lg: 3 },
          mt: -8,
          mb: 4,
          boxShadow: ({ boxShadows: { xxl } }) => xxl,
        }}
      >
        <MainFeatures />
        <MediaCard toDisplay={["exterior", "interior"]} containsHeader={false} />
        <Amenities />
      </Card>
      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}

export default Home;
