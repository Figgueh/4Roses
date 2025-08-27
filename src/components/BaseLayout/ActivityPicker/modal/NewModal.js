import PropTypes from "prop-types";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Add } from "@mui/icons-material";

import MKButton from "components/MKButton";
import MKInput from "components/MKInput";
import MKBox from "components/MKBox";

import axios from "axios";
import { slugify } from "utils";

function NewModal({ activityTitle }) {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirm = async () => {
    const activities = await axios.get(
      `${process.env.REACT_APP_BACKEND}/activities/${activityTitle}`
    );
    const id = activities.data.id;
    await axios.post(`${process.env.REACT_APP_BACKEND}/articles`, {
      activityId: id,
      url: "",
      title,
      image: "",
      description: "",
    });
    navigate(`/activities/${slugify(activityTitle)}/${slugify(title)}`);
  };

  return (
    <>
      <MKButton size="medium" color="success" variant="gradient" onClick={handleOpen}>
        <Add sx={{ mr: 1 }} /> Add article to {activityTitle} activities
      </MKButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add a New Article</DialogTitle>
        <DialogContent>
          <MKBox display="flex" flexDirection="column" gap={2}>
            Please enter the title of the {activityTitle.toLowerCase()} article you wish to add.
            <MKInput
              type="title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
            <MKBox display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleConfirm} color="primary">
                OK
              </Button>
            </MKBox>
          </MKBox>
        </DialogContent>
      </Dialog>
    </>
  );
}

NewModal.propTypes = {
  activityTitle: PropTypes.string.isRequired,
};

export default NewModal;
