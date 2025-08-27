// React imports
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Sections components
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";

// Icons
import { Delete } from "@mui/icons-material";

// Database imports
// import supabase from "connection/client";

// Components imports
import SortablePhotoAlbum from "components/SortablePhotoAlbum/SortablePhotoAlbum";
// Modal imports
import { ModalProvider } from "components/SortablePhotoAlbum/admin/ModalProvider";
import EditView from "components/SortablePhotoAlbum/admin/EditView";

// import { trimImagePath } from "utils";
import axios from "axios";

const breakpoints = [480, 768, 1024, 1280, 1600, 1920, 2560];

/*
 * PhotoViewer is responsible for fetching the photos and displaying them using
 * SortablePhotoAlbum.
 * Currently also responsible for handling selection and removal of images.
 */
function PhotoViewer({ album, refreshFlag }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      setPhotos([]);

      // Get the album images from the backend
      const photoRequest = await axios.get(`${process.env.REACT_APP_BACKEND}/images/${album}`);
      const photoData = photoRequest.data;

      /*
       * imageLink is responsible for generating the source that is used for imgix
       * If no newWidth and newHeight, then it returns the source image,
       * If they are provided, then it uses imgix to generate the dimension and returns that link.
       */
      function imageLink(path, width, height, extension, newWidth, newHeight) {
        if (newWidth && newHeight)
          return `https://fignet.imgix.net/${album}/${path}_${width}x${height}.${extension}?w=${newWidth}&h=${newHeight}&fit=max&auto=format&dpr=2`;
        return `https://fignet.imgix.net/${album}/${path}_${width}x${height}.${extension}`;
      }

      const parsedPhotos = photoData.combinedData
        .map((file) => {
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

          // Build the photo object with all the processed data.
          return {
            path: album + "/" + file.name,
            id: file.database_id,
            src: imageLink(path, width, height, extension),
            width,
            height,
            srcSet: breakpoints.map((breakpoint) => {
              const resizedHeight = Math.round((height / width) * breakpoint);
              return {
                src: imageLink(path, width, height, extension, breakpoint, resizedHeight),
                width: breakpoint,
                height: resizedHeight,
              };
            }),
            selected: false,
            display_order: file.display_order,
          };
        })
        .filter(Boolean);

      setPhotos(parsedPhotos);
    }

    fetchImages();
  }, [album, refreshFlag]);

  const handleDelete = async () => {
    const selectedPhotos = photos.filter((photo) => photo.selected);

    if (selectedPhotos.length < 1) return;

    //TODO:: Make it a model
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedPhotos.length} photos?`
    );

    if (!confirmDelete) return;

    // Get all the selected images ids
    const toDeleteIds = selectedPhotos.map((photo) => photo.id);

    // Send request to backend
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}/images/deleteMany`, {
        ids: toDeleteIds,
      });

      // Update UI only if all deletes succeeded
      setPhotos((prev) => prev.filter((photo) => !photo.selected));
    } catch (err) {
      console.error("Error deleting images:", err);
      alert("Some images could not be deleted.");
    }
  };

  return (
    <MKBox sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      {photos.filter((photo) => photo.selected).length > 0 && (
        <MKBox sx={{ mb: 2, display: "flex" }}>
          <MKButton
            size="medium"
            color="secondary"
            variant="gradient"
            sx={{ mr: 1, maxWidth: "200px" }}
            onClick={() => setPhotos((prev) => prev.map((img) => ({ ...img, selected: true })))}
          >
            Select all photos
          </MKButton>
          <MKButton
            size="medium"
            color="secondary"
            variant="gradient"
            sx={{ maxWidth: "200px" }}
            onClick={() => setPhotos((prev) => prev.map((img) => ({ ...img, selected: false })))}
          >
            Unselect all photos
          </MKButton>
          <MKButton
            size="medium"
            color="error"
            variant="gradient"
            sx={{ marginLeft: "auto", maxWidth: "250px" }}
            onClick={handleDelete}
          >
            <Delete sx={{ mr: 1 }}>Delete</Delete> Delete Selected (
            {photos.filter((photo) => photo.selected).length})
          </MKButton>
        </MKBox>
      )}

      <ModalProvider>
        <SortablePhotoAlbum photos={photos} setPhotos={setPhotos} />
        <EditView />
      </ModalProvider>
    </MKBox>
  );
}

PhotoViewer.propTypes = {
  album: PropTypes.string.isRequired,
  refreshFlag: PropTypes.bool,
};

export default PhotoViewer;
