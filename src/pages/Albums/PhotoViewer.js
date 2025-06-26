import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Sections components
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";

// Database imports
import supabase from "connection/client";

import { Delete } from "@mui/icons-material";
import { trimImagePath } from "utils";
import SortablePhotoAlbum from "components/SortablePhotoAlbum/SortablePhotoAlbum";

import { ModalProvider } from "components/SortablePhotoAlbum/admin/ModalProvider";
import EditView from "components/SortablePhotoAlbum/admin/EditView";

const breakpoints = [480, 768, 1024, 1280, 1600, 1920, 2560];

function PhotoViewer({ album, refreshFlag }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      setPhotos([]);

      // Get the actual photos
      const { data: files, error: imageError } = await supabase.storage.from("images").list(album);

      if (imageError) {
        console.error("Error listing files:", imageError.message);
        return [];
      }

      // Get image data from database
      const { data: imageData, error: imageDataError } = await supabase
        .from("image_data")
        .select("image_path,display_order");

      if (imageDataError) {
        console.error("Error listing files data:", imageDataError.message);
        return [];
      }

      // Create a map with the data to be able to link to each other easier.
      const orderMap = new Map();
      imageData.forEach((element) => {
        orderMap.set(element.image_path, element.display_order);
      });

      // Create a new variable with the image data and its display order
      const combinedData = files
        .map((file) => ({
          ...file,
          display_order: orderMap.get(album + "/" + file.name),
        }))
        .sort((a, b) => a.display_order - b.display_order);

      function imageLink(path, width, height, extension, newWidth, newHeight) {
        console.log(
          `Loaded: ${album}/${path}_${width}x${height}.${extension}`,
          newWidth,
          newHeight
        );
        if (newWidth && newHeight)
          return `https://fignet.imgix.net/${album}/${path}_${width}x${height}.${extension}?w=${newWidth}&h=${newHeight}&fit=max&auto=format&dpr=2`;
        return `https://fignet.imgix.net/${album}/${path}_${width}x${height}.${extension}`;
      }

      const parsedPhotos = combinedData
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

  useEffect(() => {
    const selectedPhotos = photos.filter((photo) => photo.selected);
    console.log(selectedPhotos);
  }, [photos]);

  const handleDelete = async () => {
    const selectedPhotos = photos.filter((photo) => photo.selected);

    if (selectedPhotos.length < 1) return;

    //TODO:: Make it a model
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedPhotos.length} photos?`
    );

    if (!confirmDelete) return;

    // Remove image
    const toDeleteUrl = selectedPhotos.map((photo) => trimImagePath(photo.src));
    const { error: error } = await supabase.storage.from("images").remove(toDeleteUrl);

    // Remove metadata
    const { error: error2 } = await supabase
      .from("image_data")
      .delete()
      .in("image_path", toDeleteUrl);

    if (error) console.log(error);
    if (error2) console.log(error2);

    const updatedPhotos = photos.filter((photo) => !photo.selected);
    setPhotos(updatedPhotos);
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
