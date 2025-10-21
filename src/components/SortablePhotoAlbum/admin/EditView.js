// @mui material components
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";

// @mui icons
import CloseIcon from "@mui/icons-material/Close";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";

import { useModal } from "./ModalProvider";
import { useEffect, useState } from "react";
import axios from "axios";

function EditView() {
  const { open, closeModal, data } = useModal();
  const [imageData, setImageData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch image data
  useEffect(() => {
    setImageData({});
    async function getDatabaseData() {
      if (data) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND}/images/imageData/${data}`
          );
          // Since Supabase returns an array, we take the first element
          if (response.data && response.data.length > 0) {
            setImageData(response.data[0]);
          }
        } catch (err) {
          console.error("Error fetching image data:", err);
        }
      }
    }
    getDatabaseData();
  }, [data]);

  // Update database with edited info
  const handleSave = async () => {
    if (!imageData?.id) return;

    try {
      setLoading(true);
      await axios.put(`${process.env.REACT_APP_BACKEND}/images/imageData/${imageData.id}`, {
        title: imageData.title,
        alt: imageData.alt,
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
    setImageData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <MKBox component="section" py={6}>
      <Container>
        <Modal open={open} onClose={closeModal} sx={{ display: "grid", placeItems: "center" }}>
          <Slide direction="down" in={open} timeout={500}>
            <MKBox
              position="relative"
              width="500px"
              display="flex"
              flexDirection="column"
              borderRadius="xl"
              bgColor="white"
              shadow="xl"
            >
              {Object.keys(imageData).length > 0 ? (
                <>
                  <MKBox display="flex" justifyContent="space-between" p={2}>
                    <MKTypography variant="h5">{imageData.image_path}</MKTypography>
                    <CloseIcon fontSize="medium" sx={{ cursor: "pointer" }} onClick={closeModal} />
                  </MKBox>

                  <Divider sx={{ my: 0 }} />

                  <MKBox p={2} display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Title"
                      variant="outlined"
                      fullWidth
                      value={imageData.title || ""}
                      onChange={handleChange("title")}
                    />
                    <TextField
                      label="Alt Text"
                      variant="outlined"
                      fullWidth
                      value={imageData.alt || ""}
                      onChange={handleChange("alt")}
                    />
                  </MKBox>

                  <Divider sx={{ my: 0 }} />

                  <MKBox display="flex" justifyContent="space-between" p={1.5}>
                    <MKButton variant="gradient" color="dark" onClick={closeModal}>
                      close
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
                <MKBox p={2} textAlign="center">
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
