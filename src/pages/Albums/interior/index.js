import { useState } from "react";

// Material Kit 2 React components
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

// Lightbox includes
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";

import "./index.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";

// Sections components
import BaseLayout from "layouts/sections/components/BaseLayout";
import MKBox from "components/MKBox";
import Grid from "@mui/material/Grid";
import CenteredBlogCard from "examples/Cards/BlogCards/CenteredBlogCard";
import Exterior from "assets/images/property/exterior/backViewBright.JPG";

import photos from "./photos";

function InteriorPhotos() {
  const [index, setIndex] = useState(-1);
  return (
    <BaseLayout
      title="Interior photos"
      breadcrumb={[
        { label: "Home page", route: "/pages/landing-pages/home" },
        { label: "Interior photos" },
      ]}
    >
      <MKBox>
        <RowsPhotoAlbum
          photos={photos}
          // columns={4}
          targetRowHeight={250}
          onClick={({ index }) => setIndex(index)}
        />
        <Lightbox
          slides={photos}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          // enable optional lightbox plugins
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom, Captions]}
        />
      </MKBox>
      <MKBox container spacing={3} alignItems="center">
        <Grid itemxs={12} lg={6} sx={{ mx: "auto", mt: { xs: 4, lg: 5 } }}>
          <CenteredBlogCard
            image={Exterior}
            title="Exterior"
            description="The exterior of this stunning rental property features lush fruit trees, a sparkling heated pool, and multiple balconies offering breathtaking views."
            action={{
              type: "internal",
              route: "/pages/albums/exterior",
              color: "info",
              label: "view more exterior pictures",
            }}
          />
        </Grid>
      </MKBox>
    </BaseLayout>
  );
}

export default InteriorPhotos;
