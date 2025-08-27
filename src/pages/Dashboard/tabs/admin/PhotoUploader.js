import React, { useState } from "react";
// import supabase from "connection/client";
import PhotoViewer from "pages/Albums/PhotoViewer";

import EditView from "components/SortablePhotoAlbum/admin/EditView";
import { ModalProvider } from "components/SortablePhotoAlbum/admin/ModalProvider";
import PropTypes from "prop-types";
import { TailSpin } from "react-loader-spinner";

// @mui material components
import Grid from "@mui/material/Grid";
import { Paper } from "@mui/material";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKInput from "components/MKInput";
import MKButton from "components/MKButton";
import { Check } from "@mui/icons-material";
import MKProgress from "components/MKProgress";
import axios from "axios";

function PhotoUploader({ album }) {
  const [images, setImages] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev);
  };

  const handleFilesChange = async (e) => {
    // Get the biggest display_order number
    const latestDisplayOrder = await axios.get(
      `${process.env.REACT_APP_BACKEND}/images/largestDisplayOrder/${album}`
    );

    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name.split(".").slice(0, -1).join(""),
      title: "",
      alt: `A picture of ${file.name.split(".").slice(0, -1).join("")}`,
      displayOrder: latestDisplayOrder.data + index + 1,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleInputChange = (index, field, value) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  };

  const getImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        resolve({ width: this.naturalWidth, height: this.naturalHeight });
      };
      img.src = url;
    });
  };

  const handleUploadAll = async () => {
    setSpinner(true);
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.file) continue;

      // Mark image for upload
      setImages((prev) =>
        prev.map((img, index) => (index === i ? { ...img, status: "uploading" } : img))
      );

      const dimensions = await getImageDimensions(img.preview);
      const fileExt = img.file.name.split(".").pop();
      const fileName = img.name || img.file.name.split(".").slice(0, -1).join("");
      const newFileName = `${fileName}_${dimensions.width}x${dimensions.height}.${fileExt}`;
      const filePath = `${album}/${newFileName}`;

      // Upload file
      const formData = new FormData();
      formData.append("image", img.file);
      formData.append("filePath", filePath);
      formData.append("image_path", filePath);
      formData.append("title", img.title);
      formData.append("alt", img.alt);
      formData.append("displayOrder", img.displayOrder);
      const uploadFileRequest = await axios.post(
        `${process.env.REACT_APP_BACKEND}/images`,
        formData
      );

      if (uploadFileRequest.status != 201) {
        console.error("Unable to upload image");
      }

      // Mark as done
      setImages((prev) =>
        prev.map((img, index) => (index === i ? { ...img, status: "done" } : img))
      );
    }

    // Reset
    setSpinner(false);
    setImages([]);
    triggerRefresh();
  };

  return (
    <MKBox p={4} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <MKTypography variant="h4" mb={2}>
        Upload to <strong>{album}</strong> Album
      </MKTypography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              style={{ marginTop: "16px" }}
            />
          </Grid>

          {images.map((img, index) => (
            <Grid item xs={12} key={index}>
              <Grid container spacing={2} alignItems="center">
                {/* Image Preview */}
                <Grid item xs={12} sm={3} md={2}>
                  <img
                    src={img.preview}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                </Grid>

                {/* Form Fields */}
                <Grid item xs={12} sm={9} md={10}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={5}>
                      <MKInput
                        label="Display Name"
                        value={img.name}
                        onChange={(e) => handleInputChange(index, "name", e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={5}>
                      <MKInput
                        label="Title"
                        value={img.title}
                        onChange={(e) => handleInputChange(index, "title", e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={5}>
                      <MKInput
                        label="Alt Text"
                        value={img.alt}
                        onChange={(e) => handleInputChange(index, "alt", e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MKInput
                        label="Display Order"
                        type="number"
                        value={img.displayOrder}
                        onChange={(e) => handleInputChange(index, "displayOrder", e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    {img.status == "uploading" && (
                      <Grid
                        item
                        xs={12}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        py={2}
                      >
                        <TailSpin
                          height={40}
                          width={40}
                          color="#6c63ff"
                          ariaLabel="uploading-spinner"
                        />
                      </Grid>
                    )}
                    {img.status == "done" && (
                      <Grid
                        item
                        xs={12}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        py={2}
                      >
                        <Check />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ))}

          {images.length > 0 && (
            <Grid item xs={12}>
              <MKButton variant="contained" color="secondary" onClick={handleUploadAll} fullWidth>
                Upload All Images
              </MKButton>
            </Grid>
          )}
          {spinner && (
            <MKProgress
              sx={{ mt: 2 }}
              color="info"
              value={(images.filter((img) => img.status === "done").length / images.length) * 100}
            />
          )}
        </Grid>
      </Paper>

      <ModalProvider sx={{ flex: 1 }}>
        <PhotoViewer album={album} refreshFlag={refreshFlag} />
        <EditView />
      </ModalProvider>
    </MKBox>
  );
}

PhotoUploader.propTypes = {
  album: PropTypes.string.isRequired,
};

export default PhotoUploader;
