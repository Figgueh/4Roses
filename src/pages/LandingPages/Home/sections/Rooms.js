// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

// Material Kit 2 React components
import MKBox from "components/MKBox";

// Material Kit 2 React examples
import CenteredBlogCard from "examples/Cards/BlogCards/CenteredBlogCard";

// Images
import Exterior from "assets/images/property/exterior/backViewBright.JPG";
import Interior from "assets/images/property/interior/livingRoomUpstairs.jpg";

function Rooms() {
  return (
    <MKBox component="section" py={12}>
      <Container>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} lg={6} sx={{ ml: "auto", mt: { xs: 3, lg: 0 } }}>
            <CenteredBlogCard
              image={Interior}
              title="Interior"
              description="The interior of this spacious home boasts two modern kitchens, four elegant bathrooms, and five generously sized bedrooms for ultimate comfort."
              action={{
                type: "internal",
                route: "pages/company/about-us",
                color: "info",
                label: "view more interior pictures",
              }}
            />
          </Grid>
          <Grid item xs={12} lg={6} sx={{ ml: "auto", mt: { xs: 3, lg: 0 } }}>
            <CenteredBlogCard
              image={Exterior}
              title="Exterior"
              description="The exterior of this stunning rental property features lush fruit trees, a sparkling heated pool, and multiple balconies offering breathtaking views."
              action={{
                type: "internal",
                route: "pages/company/about-us",
                color: "info",
                label: "view more exterior pictures",
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </MKBox>
  );
}

export default Rooms;
