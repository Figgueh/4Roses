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

// Database imports
import { checkAdmin } from "connection/users/checkAdmin";

// Admin viewer imports:
import SelectIcon from "./admin/SelectIcon";
import StyledLink from "./admin/StyledLink";

import { useModal } from "./admin/ModalProvider";

const SortablePhotoAlbum = ({ photos, setPhotos }) => {
  const [index, setIndex] = useState(-1);
  const [albumRender, setAlbumRender] = useState({});
  const { session } = UserAuth();
  const { openModal } = useModal();

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

  return (
    <>
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
    </>
  );
};

SortablePhotoAlbum.propTypes = {
  photos: PropTypes.array.isRequired,
  setPhotos: PropTypes.func.isRequired,
};

export default SortablePhotoAlbum;
