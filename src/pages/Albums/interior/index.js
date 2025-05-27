import { useState, useEffect } from "react";

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

import supabase from "connection/client";

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

function InteriorPhotos() {
  const [index, setIndex] = useState(-1);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase.storage.from("images").list("interior");

      if (error) {
        console.error("Error listing files:", error.message);
        return [];
      }

      function imageLink(path, width, height, size, extension) {
        return `https://fignet.imgix.net/interior/${path}_${width}x${height}.${extension}`;
      }

      const parsedPhotos = data
        .map((file) => {
          console.log(file);
          if (!file || !file.name) return null;
          const matcher = file.name.match("^(.*)_(\\d+)x(\\d+)\\.(.+)$");

          if (!matcher) {
            console.warn("Skipping unmatched file:", file.name);
            return null;
          }

          const path = matcher[1];
          const width = Number.parseInt(matcher[2], 10);
          const height = Number.parseInt(matcher[3], 10);
          const extension = matcher[4];

          console.log(path, width, height, extension);
          return {
            src: imageLink(path, width, height, width, extension),
            width,
            height,
            srcSet: breakpoints.map((breakpoint) => ({
              src: imageLink(path, width, height, breakpoint, extension),
              width: breakpoint,
              height: Math.round((height / width) * breakpoint),
            })),
          };
        })
        .filter(Boolean);

      setPhotos(parsedPhotos);
    }

    fetchImages();
    console.log(photos);
  }, []);

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
