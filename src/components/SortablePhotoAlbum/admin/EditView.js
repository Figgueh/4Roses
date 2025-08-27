// @mui material components
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
import Slide from "@mui/material/Slide";

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

  useEffect(() => {
    setImageData({});
    async function getDatabaseData() {
      if (data) {
        const databaseData = await axios.get(
          `${process.env.REACT_APP_BACKEND}/images/imageData/${data}`
        );
        if (databaseData != false) setImageData(databaseData.data);
      }
    }
    getDatabaseData();
  }, [data]);

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
                    <MKTypography variant="h5">{imageData?.image_path}</MKTypography>
                    <CloseIcon fontSize="medium" sx={{ cursor: "pointer" }} onClick={closeModal} />
                  </MKBox>
                  <Divider sx={{ my: 0 }} />
                  <MKBox p={2}>
                    <MKTypography variant="body2" color="secondary" fontWeight="regular">
                      Society has put up so many boundaries, so many limitations on what&apos;s
                      right and wrong that it&apos;s almost impossible to get a pure thought out.
                      <br />
                      <br />
                      It&apos;s like a little kid, a little boy, looking at colors, and no one told
                      him what colors are good, before somebody tells you you shouldn&apos;t like
                      pink because that&apos;s for girls, or you&apos;d instantly become a gay
                      two-year-old.
                    </MKTypography>
                  </MKBox>
                  <Divider sx={{ my: 0 }} />
                  <MKBox display="flex" justifyContent="space-between" p={1.5}>
                    <MKButton variant="gradient" color="dark" onClick={closeModal}>
                      close
                    </MKButton>
                    <MKButton variant="gradient" color="info">
                      save changes
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
