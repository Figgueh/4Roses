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
import BaseLayout from "components/BaseLayout";
import MKBox from "components/MKBox";
import MediaCard from "components/Cards/BlogCards/CenteredBlogCard/MediaCard";

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
      <MKBox>
        <MediaCard toDisplay={["exterior"]} containsHeader={true} />
      </MKBox>
    </BaseLayout>
  );
}

export default InteriorPhotos;
