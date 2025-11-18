import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Button, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

import MKButton from "components/MKButton";
import MKInput from "components/MKInput";
import MKBox from "components/MKBox";

import axios from "axios";

function NewModal({ activityTitle, onCreate }) {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [urls, setUrls] = useState([""]);
  const [open, setOpen] = useState(false);
  const [activityId, setActivityId] = useState("");

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };
  const addUrlField = () => setUrls([...urls, ""]);
  const handleRemoveUrl = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const validateTitle = (value) => {
    const illegal = /[^a-zA-Z0-9 ]/;

    if (illegal.test(value)) {
      setTitleError(
        "Title contains invalid characters. Only letters, numbers and spaces are allowed."
      );
      return false;
    }

    setTitleError("");
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      const activityRes = await axios.get(
        `${process.env.REACT_APP_BACKEND}/activities/${activityTitle}`
      );
      setActivityId(activityRes.data.id);
    };

    fetchData();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirm = async () => {
    if (!validateTitle(title)) {
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required.");
      return;
    }

    const urlString = urls
      .map((u) => u.trim())
      .filter((u) => u !== "")
      .join(", ");

    const newArticle = {
      id: uuidv4(),
      activityId: activityId,
      activityName: activityTitle,
      title,
      description,
      url: urlString,
      address: address,
      image: "https://placehold.co/600x600?text=Placeholder%20image",
      isPreview: true,
      content: [
        {
          title: "Heading section title",
          content: "Heading section content",
        },
        {
          title: "Section 1 title",
          content: "Section 1 content",
          detail: ["Section 1 detail 1", "Section 1 detail 2", "Section 1 detail 3"],
        },
        {
          title: "Section 2 title",
          content: "Section 2 content",
        },
      ],
    };

    onCreate(newArticle);
    setOpen(false);
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
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                validateTitle(val);
              }}
              error={Boolean(titleError)}
              helperText={titleError}
            />
            <MKInput
              label="Description (required)"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
            <MKInput
              label="Company address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
            />
            {/* URL List */}
            <MKBox display="flex" flexDirection="column" gap={1}>
              {urls.map((url, index) => (
                <MKBox key={index} display="flex" alignItems="center" gap={1}>
                  <MKInput
                    type="text"
                    label={`URL ${index + 1}`}
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    fullWidth
                  />
                  <IconButton color="error" onClick={() => handleRemoveUrl(index)}>
                    <Delete />
                  </IconButton>
                </MKBox>
              ))}

              <Button onClick={addUrlField}>Add another URL</Button>
            </MKBox>
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
  onCreate: PropTypes.func,
};

export default NewModal;
