// @mui material components
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
import Slide from "@mui/material/Slide";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// @mui icons
import CloseIcon from "@mui/icons-material/Close";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import MKInput from "components/MKInput";

import { useModal } from "./ModalProvider";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { ROOM_OPTIONS, getFloorFromRoomId } from "utils.js";

function EditView() {
  const { open, closeModal, data } = useModal();
  const [imageData, setImageData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const imageId = data?.imageId;
  const updatePhoto = data?.updatePhoto;

  const availableRooms = useMemo(() => {
    return selectedFloor ? ROOM_OPTIONS[selectedFloor] : [];
  }, [selectedFloor]);

  useEffect(() => {
    setImageData({});
    setSelectedFloor("");
    setSelectedRoom("");

    async function getDatabaseData() {
      if (!data) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND}/images/imageData/${imageId}`
        );

        if (response.data && response.data.length > 0) {
          const dbImage = response.data[0];
          const roomId = dbImage.room || "";

          setImageData(dbImage);
          setSelectedRoom(roomId);
          setSelectedFloor(getFloorFromRoomId(roomId));
        }
      } catch (err) {
        console.error("Error fetching image data:", err);
      }
    }

    getDatabaseData();
  }, [data]);

  const handleSave = async () => {
    if (!imageData?.id) return;

    try {
      setLoading(true);

      await axios.put(`${process.env.REACT_APP_BACKEND}/images/imageData/${imageData.id}`, {
        title: imageData.title,
        alt: imageData.alt,
        roomId: selectedRoom || null,
      });

      closeModal();
    } catch (err) {
      console.error("Error saving image data:", err);
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setImageData((prev) => ({ ...prev, [field]: value }));

    updatePhoto?.({
      [field]: value,
    });
  };

  const handleFloorChange = (event) => {
    const newFloor = event.target.value;
    setSelectedFloor(newFloor);
    setSelectedRoom("");
  };

  const handleRoomChange = (event) => {
    const newRoomId = event.target.value;

    setSelectedRoom(newRoomId);

    updatePhoto?.({
      roomId: newRoomId,
    });
  };

  return (
    <MKBox component="section">
      <Container>
        <Modal
          open={open}
          onClose={closeModal}
          sx={{ display: "grid", placeItems: "center", p: 2 }}
        >
          <Slide direction="down" in={open} timeout={400}>
            <MKBox
              position="relative"
              width="100%"
              maxWidth="560px"
              display="flex"
              flexDirection="column"
              borderRadius="xl"
              bgColor="white"
              shadow="xl"
              sx={{
                maxHeight: "90vh",
                overflow: "hidden",
              }}
            >
              {Object.keys(imageData).length > 0 ? (
                <>
                  <MKBox
                    px={3}
                    py={2.5}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={2}
                  >
                    <MKBox minWidth={0}>
                      <MKTypography variant="h5" mb={0.5}>
                        Edit image
                      </MKTypography>
                      <MKTypography
                        variant="button"
                        color="text"
                        sx={{
                          display: "block",
                          wordBreak: "break-word",
                          lineHeight: 1.5,
                        }}
                      >
                        {imageData.image_path}
                      </MKTypography>
                    </MKBox>

                    <MKBox
                      onClick={closeModal}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: "2px",
                        flexShrink: 0,
                      }}
                    >
                      <CloseIcon fontSize="medium" />
                    </MKBox>
                  </MKBox>

                  <Divider sx={{ my: 0 }} />

                  <MKBox
                    px={3}
                    py={3}
                    sx={{
                      overflowY: "auto",
                    }}
                  >
                    <MKBox display="flex" flexDirection="column" gap={2.5}>
                      <MKInput
                        label="Title"
                        fullWidth
                        value={imageData.title || ""}
                        onChange={handleChange("title")}
                      />

                      <MKInput
                        label="Alt Text"
                        fullWidth
                        value={imageData.alt || ""}
                        onChange={handleChange("alt")}
                      />

                      <FormControl fullWidth>
                        <InputLabel id="floor-select-label">Floor</InputLabel>
                        <Select
                          labelId="floor-select-label"
                          value={selectedFloor}
                          label="Floor"
                          onChange={handleFloorChange}
                          sx={{ minHeight: 40 }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value="first">First floor</MenuItem>
                          <MenuItem value="second">Second floor</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth disabled={!selectedFloor}>
                        <InputLabel id="room-select-label">Room</InputLabel>
                        <Select
                          labelId="room-select-label"
                          value={selectedRoom}
                          label="Room"
                          onChange={handleRoomChange}
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
                    </MKBox>
                  </MKBox>

                  <Divider sx={{ my: 0 }} />

                  <MKBox
                    px={3}
                    py={2}
                    display="flex"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap={1.5}
                  >
                    <MKButton variant="outlined" color="dark" onClick={closeModal}>
                      Close
                    </MKButton>

                    <MKButton
                      variant="gradient"
                      color="info"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </MKButton>
                  </MKBox>
                </>
              ) : (
                <MKBox p={3} textAlign="center">
                  <MKTypography variant="body2" color="text">
                    No data
                  </MKTypography>
                </MKBox>
              )}
            </MKBox>
          </Slide>
        </Modal>
      </Container>
    </MKBox>
  );
}

export default EditView;
