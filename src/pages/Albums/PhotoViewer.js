import { useState, useEffect } from "react";
import { UserAuth } from "connection/auth/authContext";
import PropTypes from "prop-types";

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
import MKBox from "components/MKBox";

// Database imports
import supabase from "connection/client";
import { checkAdmin } from "connection/users/checkAdmin";

// Admin viewer imports:
import SelectIcon from "./admin/SelectIcon";
import StyledLink from "./admin/StyledLink";

import { useModal } from "./admin/ModalProvider";

const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

function PhotoViewer({ album }) {
  const [index, setIndex] = useState(-1);
  const [photos, setPhotos] = useState([]);
  const { session } = UserAuth();
  const [albumRender, setAlbumRender] = useState({});
  const { openModal } = useModal();

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase.storage.from("images").list("interior");

      if (error) {
        console.error("Error listing files:", error.message);
        return [];
      }

      function imageLink(path, width, height, extension) {
        return `https://fignet.imgix.net/${album}/${path}_${width}x${height}.${extension}`;
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

          return {
            src: imageLink(path, width, height, extension),
            width,
            height,
            srcSet: breakpoints.map((breakpoint) => ({
              src: imageLink(path, width, height, extension),
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
  }, []);

  useEffect(() => {
    const userCheck = async () => {
      if (session?.user?.id) {
        const isAdmin = await checkAdmin(session.user.id);

        if (isAdmin) {
          setAlbumRender({
            link: (props) => <StyledLink {...props} />,
            extras: (_, { photo, index }) => (
              <SelectIcon
                selected={photo.selected}
                onClickEdit={(event) => {
                  openModal(photo.src);

                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClickSelect={(event) => {
                  setPhotos((prevPhotos) => {
                    const newPhotos = [...prevPhotos];
                    newPhotos[index].selected = !photo.selected;
                    return newPhotos;
                  });

                  // const selectedPhotos = photos.filter((photo) => photo.selected);
                  // console.log(selectedPhotos);

                  event.preventDefault();
                  event.stopPropagation();
                }}
              />
            ),
          });
        } else {
          setAlbumRender({});
        }
      }
    };

    userCheck();
  }, [session]);

  useEffect(() => {
    const selectedPhotos = photos.filter((photo) => photo.selected);
    console.log(selectedPhotos);
  }, [photos]);

  return (
    <MKBox>
      <RowsPhotoAlbum
        photos={photos}
        targetRowHeight={250}
        onClick={({ index }) => setIndex(index)}
        render={albumRender}
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
  );
}

// Typechecking props for the BaseLayout
PhotoViewer.propTypes = {
  album: PropTypes.string.isRequired,
};

export default PhotoViewer;
