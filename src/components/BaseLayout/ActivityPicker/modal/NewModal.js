// App.jsx or SimpleModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import MKButton from "components/MKButton";
import { Add } from "@mui/icons-material";
import PropTypes from "prop-types";
import MKInput from "components/MKInput";
import MKBox from "components/MKBox";
import { addNewArticle } from "connection/articles/addNewArticle";
import { slugify } from "utils";
import { fetchActivitiesIdByName } from "connection/activities/fetchActivitiesIdByName";

function NewModal({ activityTitle }) {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirm = async () => {
    const id = await fetchActivitiesIdByName(activityTitle);
    await addNewArticle(id, "", title);
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
