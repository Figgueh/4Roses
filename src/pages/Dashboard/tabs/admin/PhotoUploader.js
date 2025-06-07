import React, { useState } from "react";
import supabase from "connection/client";
import PhotoViewer from "pages/Albums/PhotoViewer";
import EditView from "pages/Albums/admin/EditView";
import { ModalProvider } from "pages/Albums/admin/ModalProvider";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import { Paper } from "@mui/material";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKInput from "components/MKInput";
import MKButton from "components/MKButton";

function PhotoUploader({ album }) {
  const [images, setImages] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev);
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: "",
      title: "",
      alt: "",
      displayOrder: "",
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleInputChange = (index, field, value) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  };

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        resolve({ width: this.naturalWidth, height: this.naturalHeight });
        URL.revokeObjectURL(this.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUploadAll = async () => {
    for (const img of images) {
      if (!img.file) continue;

      const dimensions = await getImageDimensions(img.file);
      const fileExt = img.file.name.split(".").pop();
      const fileName = img.name || img.file.name.split(".").slice(0, -1).join("");
      const newFileName = `${fileName}_${dimensions.width}x${dimensions.height}.${fileExt}`;
      const filePath = `${album}/${newFileName}`;

      // Upload file
      const { error: imageDataError } = await supabase.storage
        .from("images")
        .upload(filePath, img.file);

      if (imageDataError) {
        console.error("Upload error:", imageDataError);
        continue;
      }

      // Insert metadata
      const { error: metaError } = await supabase.from("image_data").insert({
        image_path: filePath,
        title: img.title,
        alt: img.alt,
        display_order: parseInt(img.displayOrder, 10) || 0,
      });

      if (metaError) {
        console.error("Metadata insert error:", metaError);
      }
    }

    // Reset
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
            <React.Fragment key={index}>
              <Grid item xs={12} sm={2}>
                <img
                  src={img.preview}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <MKInput
                  label="Display Name"
                  value={img.name}
                  onChange={(e) => handleInputChange(index, "name", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <MKInput
                  label="Title"
                  value={img.title}
                  onChange={(e) => handleInputChange(index, "title", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <MKInput
                  label="Alt Text"
                  value={img.alt}
                  onChange={(e) => handleInputChange(index, "alt", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <MKInput
                  label="Display Order"
                  type="number"
                  value={img.displayOrder}
                  onChange={(e) => handleInputChange(index, "displayOrder", e.target.value)}
                  fullWidth
                />
              </Grid>
            </React.Fragment>
          ))}

          {images.length > 0 && (
            <Grid item xs={12}>
              <MKButton variant="contained" color="secondary" onClick={handleUploadAll} fullWidth>
                Upload All Images
              </MKButton>
            </Grid>
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
