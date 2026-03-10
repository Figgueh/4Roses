import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

import { Skeleton, Grid, Box } from "@mui/material";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

import CenteredBlogCard from "..";
import { useTranslation } from "react-i18next";
import axios from "axios";

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
        } else if (entry.boundingClientRect.top > 0) {
          el.style.opacity = "0";
          el.style.transform = "translateY(28px)";
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

function MediaCard({ toDisplay, containsHeader }) {
  const { t } = useTranslation();
  const [displayPhotos, setDisplayPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPhotos = async () => {
      try {
        const exteriorResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND}/images/display/exterior`
        );
        const interiorResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND}/images/display/interior`
        );
        const videoResponse = await axios.get(`${process.env.REACT_APP_BACKEND}/videos/display`);

        setDisplayPhotos([exteriorResponse.data, interiorResponse.data, videoResponse.data]);
      } catch (error) {
        console.error("Failed to fetch display photos:", error);
      } finally {
        setLoading(false);
      }
    };

    getPhotos();
  }, [toDisplay]);

  const mediaData = {
    exterior: {
      image: displayPhotos[0]?.image_path,
      title: `${t("Exterior")}`,
      description: `${t(
        "The exterior of this stunning rental property features lush fruit trees, a sparkling salt water heated pool, and multiple balconies offering breathtaking views."
      )}`,
      action: {
        type: "internal",
        route: "/pages/albums/exterior",
        color: "info",
        label: `${t("View more exterior pictures")}`,
      },
    },
    interior: {
      image: displayPhotos[1]?.image_path,
      title: `${t("Interior")}`,
      description: `${t(
        "Step inside this beautifully designed home featuring elegant decor, spacious living areas, and luxurious amenities for ultimate comfort."
      )}`,
      action: {
        type: "internal",
        route: "/pages/albums/interior",
        color: "info",
        label: `${t("View more interior pictures")}`,
      },
    },
    video: {
      image: displayPhotos[2]?.thumbnail,
      title: "Videos",
      description: t(
        "Watch stunning video walkthroughs of the property showcasing its beauty in full motion."
      ),
      action: {
        type: "internal",
        route: "/pages/albums/videos",
        color: "info",
        label: t("Watch videos"),
      },
    },
  };

  let message;
  if (toDisplay.includes("exterior") && toDisplay.includes("interior")) {
    message = t("checkout our gallery featuring exquisite exteriors and stunning interior");
  } else {
    if (toDisplay.includes("exterior")) {
      message = t("checkout our gallery featuring exquisite exteriors");
    }
    if (toDisplay.includes("interior")) {
      message = t("checkout our gallery featuring stunning interior");
    }
  }
  if (toDisplay.includes("video")) {
    message += t(" and immersive videos.");
  } else {
    message += ".";
  }

  return (
    <Grid>
      {containsHeader && (
        <FadeInBox>
          <MKBox>
            <MKTypography align="center" mt={2} variant="h2" fontWeight="regular">
              {t("Experience the beauty of our property")}
            </MKTypography>
            <MKTypography align="center" mt={2} variant="h4" fontWeight="regular">
              {message}
            </MKTypography>
          </MKBox>
        </FadeInBox>
      )}

      <Grid container spacing={3} mt={4} justifyContent="center" alignItems="stretch">
        {toDisplay.map((item, idx) => (
          <Grid key={item} item xs={12} sm={6} lg={4} style={{ display: "flex" }}>
            <FadeInBox delay={idx * 0.1} sx={{ width: "100%", display: "flex" }}>
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={600}
                  sx={{ borderRadius: 2 }}
                />
              ) : (
                <CenteredBlogCard
                  image={mediaData[item]?.image}
                  title={mediaData[item]?.title}
                  description={mediaData[item]?.description}
                  action={mediaData[item]?.action}
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                />
              )}
            </FadeInBox>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}

MediaCard.propTypes = {
  toDisplay: PropTypes.arrayOf(PropTypes.string).isRequired,
  containsHeader: PropTypes.bool.isRequired,
};

export default MediaCard;
