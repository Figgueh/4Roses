import { useState } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar";
import PriceSummary from "./PriceSummary";
import DefaultNavbar from "components/DefaultNavbar";
import { useTranslation } from "react-i18next";
import { routes } from "routes";
import MKBox from "components/MKBox";
import DefaultFooter from "components/Footers/DefaultFooter";
import footerRoutes from "footer.routes";
import bgImage from "assets/images/property/exterior/frontGroundFloor.JPG";
import Container from "@mui/material/Container";
import MKTypography from "components/MKTypography";
import Grid from "@mui/material/Grid";
import { Card } from "@mui/material";
import BookingOptions from "./BookingOptions";

export default function BookingPage() {
  const { t } = useTranslation();
  const translatedRoutes = routes(t);
  const [bookingData, setBookingData] = useState({ selectedDates: {}, guests: 1 });

  return (
    <>
      <DefaultNavbar routes={translatedRoutes} />

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
              {t("Booking selection and price breakdown")}
            </MKTypography>
            <MKTypography variant="body1" color="white" opacity={0.8} mt={1} mb={3}>
              {t("Take advantage of a 5% discount for booking directly with us")}
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
        <AvailabilityCalendar
          icsUrls={[
            {
              url: "https://www.airbnb.ca/calendar/ical/685302237883325603.ics?s=eac91e56e2412fa2d4e6e3a2cd41361a",
              name: "Airbnb",
            },
            {
              url: "https://ical.booking.com/v1/export?t=b6fb13e3-9a9e-4502-8d65-5cda7784b6a7",
              name: "Booking.com",
            },
            {
              url: "http://www.vrbo.com/icalendar/23c22c9fe2234081906c2953e22e43d4.ics?nonTentative",
              name: "VRBO",
            },
            {
              url: `${process.env.REACT_APP_BACKEND}/reservation/calendar.ics`,
              name: "4Roses",
            },
          ]}
          selectedDates={bookingData.selectedDates}
          onSelectionChange={(selectedDates) =>
            setBookingData((prev) => ({ ...prev, selectedDates }))
          }
        />
        {Object.keys(bookingData.selectedDates).length > 0 && (
          <>
            <BookingOptions bookingData={bookingData} setBookingData={setBookingData} />
            <PriceSummary bookingData={bookingData} />
          </>
        )}
      </Card>
      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}
