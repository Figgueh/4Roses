// react-router-dom components
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Presentation page components
import ExampleCard from "examples/Cards/ExampleCard";

// Database connection imports
import { fetchAmenities } from "connection/amenities/fetchAmenities";
import { fetchActivities } from "connection/activities/fetchActivities";

function Amenities() {
  const [amenities, setAmenities] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setAmenities(await fetchAmenities());
      setActivities(await fetchActivities());
    };

    loadData();
  }, []);

  const data = [
    {
      title: "Included Amenities",
      description: "All these amenities are included",
      items: amenities,
      smallItems: [],
    },
    {
      title: "Nearby activities",
      description: "All of these activities are offered",
      items: activities,
      smallItems: [],
    },
  ];

  const renderData = data.map(({ title, description, items, smallItems }) => (
    <Grid container spacing={3} sx={{ mb: 10 }} key={title}>
      <Grid item xs={12} lg={3}>
        <MKBox position="sticky" top="100px" pb={{ xs: 2, lg: 6 }}>
          <MKTypography variant="h3" fontWeight="bold" mb={1}>
            {title}
          </MKTypography>
          <MKTypography variant="body2" fontWeight="regular" color="secondary" mb={1} pr={2}>
            {description}
          </MKTypography>
        </MKBox>
      </Grid>
      <Grid item xs={12} lg={9}>
        <Grid container spacing={3}>
          {items.map(({ image, name, sub, route, pro }) => (
            <Grid item xs={12} md={4} sx={{ mb: 2 }} id={name} key={name}>
              <Link to={pro ? "/" : route}>
                <ExampleCard image={image} name={name} sub={sub} pro={pro} />
              </Link>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid container spacing={10} pt={4} pl={3}>
        {smallItems.map(({ image, name, sub }) => (
          <Grid item xs={12} md={3} sx={{ mb: 1 }} id={name} key={name}>
            {image}
            <MKTypography variant="h6">{name}</MKTypography>
            <MKTypography variant="h6" fontWeight="regular">
              {sub}
            </MKTypography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  ));

  return (
    <MKBox component="section" my={6} py={6}>
      <Container>
        <Grid
          container
          item
          xs={12}
          lg={6}
          flexDirection="column"
          alignItems="center"
          sx={{ textAlign: "center", my: 6, mx: "auto", px: 0.75 }}
        >
          <MKTypography variant="h2" fontWeight="bold">
            All the amenities and activities
          </MKTypography>
          <MKTypography variant="body1" color="text">
            We got everything you could want and enough to keep busy
          </MKTypography>
        </Grid>
      </Container>
      <Container sx={{ mt: 6 }}>{renderData}</Container>
    </MKBox>
  );
}

export default Amenities;
