import React, { useState } from "react";
import PhotoViewer from "pages/Albums/PhotoViewer";

import EditView from "components/SortablePhotoAlbum/admin/EditView";
import { ModalProvider } from "components/SortablePhotoAlbum/admin/ModalProvider";
import PropTypes from "prop-types";
import { TailSpin } from "react-loader-spinner";

// @mui material components
import Grid from "@mui/material/Grid";
import { Divider, Paper } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKInput from "components/MKInput";
import MKButton from "components/MKButton";
import { Check } from "@mui/icons-material";
import MKProgress from "components/MKProgress";
import axios from "axios";
import { slugify } from "utils";

import { ROOM_OPTIONS } from "utils.js";

function PhotoUploader({ album }) {
  const [images, setImages] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const showFloorSelector = album !== "exterior";

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev);
  };

  const handleFilesChange = async (e) => {
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
      floor: "",
      roomId: "",
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleInputChange = (index, field, value) => {
    setImages((prev) =>
      prev.map((img, i) => {
        if (i !== index) return img;

        if (field === "name") {
          return {
            ...img,
            name: value,
            alt: img.altManuallyEdited ? img.alt : `A picture of ${value}`,
          };
        }

        if (field === "alt") {
          return { ...img, alt: value, altManuallyEdited: true };
        }

        if (field === "floor") {
          return { ...img, floor: value, roomId: "" };
        }

        return { ...img, [field]: value };
      })
    );
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

      setImages((prev) =>
        prev.map((image, index) => (index === i ? { ...image, status: "uploading" } : image))
      );

      const dimensions = await getImageDimensions(img.preview);
      const fileExt = img.file.name.split(".").pop();
      const fileName = img.name || img.file.name.split(".").slice(0, -1).join("");
      const newFileName = `${slugify(fileName)}_${dimensions.width}x${
        dimensions.height
      }.${fileExt}`;
      const filePath = `${album}/${newFileName}`;

      const formData = new FormData();
      formData.append("image", img.file);
      formData.append("filePath", filePath);
      formData.append("image_path", filePath);
      formData.append("title", img.title);
      formData.append("alt", img.alt);
      formData.append("displayOrder", img.displayOrder);

      if (showFloorSelector) {
        formData.append("roomId", img.roomId || "");
      }

      const uploadFileRequest = await axios.post(
        `${process.env.REACT_APP_BACKEND}/images`,
        formData
      );

      if (uploadFileRequest.status !== 201) {
        console.error("Unable to upload image");
      }

      setImages((prev) =>
        prev.map((image, index) => (index === i ? { ...image, status: "done" } : image))
      );
    }

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

          {images.map((img, index) => {
            const availableRooms = img.floor ? ROOM_OPTIONS[img.floor] || [] : [];

            return (
              <Grid item xs={12} key={index}>
                {/* Divider between images */}
                {index > 0 && <Divider sx={{ mb: 3 }} />}

                <Paper
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 2, backgroundColor: "grey.50" }}
                >
                  <Grid container spacing={3} alignItems="flex-start">
                    {/* Preview */}
                    <Grid item xs={12} sm={3} md={2}>
                      <img
                        src={img.preview}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                          display: "block",
                        }}
                      />
                      {img.status === "uploading" && (
                        <MKBox display="flex" justifyContent="center" mt={1}>
                          <TailSpin
                            height={32}
                            width={32}
                            color="#6c63ff"
                            ariaLabel="uploading-spinner"
                          />
                        </MKBox>
                      )}
                      {img.status === "done" && (
                        <MKBox display="flex" justifyContent="center" mt={1}>
                          <Check color="success" />
                        </MKBox>
                      )}
                    </Grid>

                    {/* Fields */}
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
                            onChange={(e) =>
                              handleInputChange(index, "displayOrder", e.target.value)
                            }
                            fullWidth
                          />
                        </Grid>

                        {showFloorSelector && (
                          <>
                            <Grid item xs={12} sm={6} md={5}>
                              <FormControl fullWidth>
                                <InputLabel id={`floor-label-${index}`}>Floor</InputLabel>
                                <Select
                                  labelId={`floor-label-${index}`}
                                  value={img.floor}
                                  label="Floor"
                                  onChange={(e) =>
                                    handleInputChange(index, "floor", e.target.value)
                                  }
                                  sx={{ minHeight: 40 }}
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  <MenuItem value="first">First floor</MenuItem>
                                  <MenuItem value="second">Second floor</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                              <FormControl fullWidth disabled={!img.floor}>
                                <InputLabel id={`room-label-${index}`}>Room</InputLabel>
                                <Select
                                  labelId={`room-label-${index}`}
                                  value={img.roomId}
                                  label="Room"
                                  onChange={(e) =>
                                    handleInputChange(index, "roomId", e.target.value)
                                  }
                                  sx={{ minHeight: 40 }}
                                >
                                  <MenuItem value="">
                                    <em>None</em>
                                  </MenuItem>
                                  {availableRooms.map((room) => (
                                    <MenuItem key={room.value} value={room.value}>
                                      {room.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            );
          })}

          {images.length > 0 && (
            <Grid item xs={12} mt={1}>
              <MKButton variant="contained" color="secondary" onClick={handleUploadAll} fullWidth>
                Upload All Images
              </MKButton>
            </Grid>
          )}

          {spinner && (
            <Grid item xs={12}>
              <MKProgress
                color="info"
                value={(images.filter((img) => img.status === "done").length / images.length) * 100}
              />
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
