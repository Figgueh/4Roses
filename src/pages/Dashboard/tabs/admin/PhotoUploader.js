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
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");

  async function handleUpload() {
    if (!file) return alert("Choose file");

    // Prepare file name
    const dimensions = await getImageDimensions(file);
    const fileExt = file.name.split(".").pop();
    const fileName = file.name.split(".").slice(0, -1);
    const newFileName = `${fileName}_${dimensions.width}x${dimensions.height}.${fileExt}`;

    // Upload image
    const { imageDataError } = await supabase.storage
      .from("images")
      .upload(`${album}/${newFileName}`, file);

    if (imageDataError) return console.error(imageDataError);

    // Upload meta data
    const { imageMetaDataError } = await supabase
      .from("image_data")
      .insert({ image_path: album + "/" + newFileName, title: "", alt: "", display_order: 2 });

    if (imageMetaDataError) console.log(imageMetaDataError);

    setFile(null);
    setName("");
  }

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        resolve({
          width: this.naturalWidth,
          height: this.naturalHeight,
        });
        URL.revokeObjectURL(this.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <MKBox p={4} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <MKTypography variant="h4" mb={2}>
        Upload to <strong>{album}</strong> Album
      </MKTypography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MKInput
              label="Display Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional custom name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MKInput
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginTop: "16px" }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MKInput
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MKInput
              label="Alt Text"
              fullWidth
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MKInput
              label="Display Order"
              type="number"
              fullWidth
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <MKButton variant="contained" color="secondary" onClick={handleUpload} fullWidth>
              Upload Image
            </MKButton>
          </Grid>
        </Grid>
      </Paper>

      <ModalProvider sx={{ flex: 1 }}>
        <PhotoViewer album={album} />
        <EditView />
      </ModalProvider>
    </MKBox>
  );
}

PhotoUploader.propTypes = {
  album: PropTypes.string.isRequired,
};

export default PhotoUploader;
