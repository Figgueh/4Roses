// react-router-dom components
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Presentation page components
import ExampleCard from "components/Cards/ExampleCard";

import axios from "axios";
import { slugify } from "utils";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line react/prop-types
function FadeInBox({ children, delay = 0, sx = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: 0,
        transform: "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function Amenities() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const [largeAmenities, setLargeAmenities] = useState([]);
  const [smallAmenities, setSmallAmenities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const largeAmenitiesRequest = await axios.get(
        `${process.env.REACT_APP_BACKEND}/amenities/big?lang=${i18n.language}`
      );
      setLargeAmenities(largeAmenitiesRequest.data);
      const smallAmenitiesRequest = await axios.get(
        `${process.env.REACT_APP_BACKEND}/amenities/small?lang=${i18n.language}`
      );
      setSmallAmenities(smallAmenitiesRequest.data);
      const activitiesRequest = await axios.get(
        `${process.env.REACT_APP_BACKEND}/activities?lang=${i18n.language}`
      );
      setActivities(activitiesRequest.data);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND}/amenities/small?lang=${i18n.language}`)
      .then((res) => setSmallAmenities(res.data));
    axios
      .get(`${process.env.REACT_APP_BACKEND}/amenities/big?lang=${i18n.language}`)
      .then((res) => setLargeAmenities(res.data));
    axios
      .get(`${process.env.REACT_APP_BACKEND}/activities?lang=${i18n.language}`)
      .then((res) => setActivities(res.data));
  }, [i18n.language]);

  const data = [
    {
      title: `${t("Included Amenities")}`,
      description: `${t("All these amenities are included")}`,
      items: largeAmenities,
      smallItems: smallAmenities,
    },
    {
      title: `${t("Nearby activities")}`,
      description: `${t("All of these activities are offered")}`,
      items: activities,
      smallItems: [],
    },
  ];

  const renderSkeletons = (count = 6) => (
    <Grid container spacing={3}>
      {Array.from(new Array(count)).map((_, idx) => (
        <Grid item xs={12} md={4} key={idx}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            sx={{ borderRadius: "0.75rem" }}
          />
          <Skeleton width="80%" sx={{ mt: 1 }} />
          <Skeleton width="60%" />
        </Grid>
      ))}
    </Grid>
  );

  const renderData = data.map(({ title, description, items, smallItems }) => (
    <Grid container spacing={3} sx={{ mb: 10 }} key={title}>
      {/* Sticky section label */}
      <Grid item xs={12} lg={3}>
        <FadeInBox>
          <MKBox position="sticky" top="100px" pb={{ xs: 2, lg: 6 }}>
            <MKTypography variant="h3" fontWeight="bold" mb={1}>
              {title}
            </MKTypography>
            <MKTypography variant="body2" fontWeight="regular" color="secondary" mb={1} pr={2}>
              {description}
            </MKTypography>
          </MKBox>
        </FadeInBox>
      </Grid>

      {/* Main cards */}
      <Grid item xs={12} lg={9}>
        {loading ? (
          renderSkeletons(6)
        ) : (
          <Grid container spacing={3}>
            {items.length > 0 &&
              items.map(({ image, title: itemTitle, description: itemDesc, slug, pro }, idx) => (
                <Grid item xs={12} md={4} sx={{ mb: 2 }} id={slugify(itemTitle)} key={itemTitle}>
                  <FadeInBox delay={idx * 0.06}>
                    {slug ? (
                      <Link to={slug}>
                        <ExampleCard
                          image={image}
                          name={itemTitle}
                          description={itemDesc}
                          pro={pro}
                        />
                      </Link>
                    ) : (
                      <ExampleCard
                        image={image}
                        name={itemTitle}
                        description={itemDesc}
                        pro={pro}
                        sx={{ transform: "none" }}
                      />
                    )}
                  </FadeInBox>
                </Grid>
              ))}
          </Grid>
        )}
      </Grid>

      {/* Small items */}
      <Grid container spacing={10} pt={4} pl={3}>
        {smallItems.length > 0 &&
          smallItems.map(({ image, title: itemTitle, description: itemDesc }, idx) => (
            <Grid item xs={12} md={3} sx={{ mb: 1 }} id={itemTitle} key={itemTitle}>
              <FadeInBox delay={idx * 0.05}>
                <MKBox component="img" src={image} alt={itemTitle} width="50px" />
                <MKTypography variant="h6">{itemTitle}</MKTypography>
                <MKTypography variant="h6" fontWeight="regular">
                  {itemDesc}
                </MKTypography>
              </FadeInBox>
            </Grid>
          ))}
      </Grid>
    </Grid>
  ));

  return (
    <MKBox component="section" my={6} py={6}>
      {/* Section header */}
      <Container>
        <FadeInBox>
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
              {t("All the amenities and activities")}
            </MKTypography>
            <MKTypography variant="body1" color="text">
              {t("We got everything you could want and enough to keep busy")}
            </MKTypography>
          </Grid>
        </FadeInBox>
      </Container>

      <Container sx={{ mt: 6 }}>{renderData}</Container>
    </MKBox>
  );
}

export default Amenities;
