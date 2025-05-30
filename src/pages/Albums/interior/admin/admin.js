import { useState, useEffect } from "react";

// yet-another-react-lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// react-photo-album
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

import SelectIcon from "./components/SelectIcon";
import StyledLink from "./components/StyledLink";

// Database imports
import supabase from "connection/client";

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

function AdminInteriorPhotos() {
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
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
            selected: false,
          };
        })
        .filter(Boolean);

      setPhotos(parsedPhotos);
    }

    fetchImages();
    console.log(photos);
  }, []);

  return (
    <>
      <RowsPhotoAlbum
        photos={photos}
        targetRowHeight={150}
        render={{
          link: (props) => <StyledLink {...props} />,
          extras: (_, { photo, index }) => (
            <SelectIcon
              selected={photo.selected}
              onClick={(event) => {
                setPhotos((prevPhotos) => {
                  const newPhotos = [...prevPhotos];
                  newPhotos[index].selected = !photo.selected;
                  return newPhotos;
                });

                const selectedPhotos = photos.filter((photo) => photo.selected);
                console.log(selectedPhotos);

                event.preventDefault();
                event.stopPropagation();
              }}
            />
          ),
        }}
        componentsProps={{
          link: ({ photo }) =>
            photo.href?.startsWith("http")
              ? { target: "_blank", rel: "noreferrer noopener" }
              : undefined,
        }}
        onClick={({ event, photo }) => {
          if (event.shiftKey || event.altKey || event.metaKey) return;
          event.preventDefault();
          setLightboxPhoto(photo);
        }}
        sizes={{
          size: "1168px",
          sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
        }}
        breakpoints={[220, 360, 480, 600, 900, 1200]}
      />

      <Lightbox
        open={Boolean(lightboxPhoto)}
        close={() => setLightboxPhoto(null)}
        slides={lightboxPhoto ? [lightboxPhoto] : undefined}
        carousel={{ finite: true }}
        render={{ buttonPrev: () => null, buttonNext: () => null }}
        styles={{ root: { "--yarl__color_backdrop": "rgba(0, 0, 0, .8)" } }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullUp: true,
          closeOnPullDown: true,
        }}
      />
    </>
  );
}

export default AdminInteriorPhotos;
