import PropTypes from "prop-types";
import MKButton from "components/MKButton";
import React, { useEffect, useState } from "react";
import { Modal, Box, TextField } from "@mui/material";
import { Alert, AlertTitle } from "@mui/material";
import axios from "axios";
import { Add } from "@mui/icons-material";
import MKBox from "components/MKBox";

import { useTranslation } from "react-i18next";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

SortableItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  children: PropTypes.node.isRequired,
};

function ActivityEditor() {
  const [activities, setActivities] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  const sensors = useSensors(useSensor(PointerSensor));

  const loadActivities = async () => {
    const databaseActivities = await axios.get(
      `${process.env.REACT_APP_BACKEND}/activities?lang=${i18n.language}`
    );
    setActivities(databaseActivities.data);
  };

  useEffect(() => {
    loadActivities();
  }, [i18n.language]);

  const handleSave = async () => {
    if (!title || (editingId === null && !imageFile)) return;
    const formData = new FormData();
    formData.append("title", title);

    if (imageFile) {
      const filePath = `activities/${imageFile.name}`;
      formData.append("imageUrl", filePath);
      formData.append("image", imageFile);
    }

    if (editingId) {
      await axios.put(
        `${process.env.REACT_APP_BACKEND}/activities/${editingId}?lang=${i18n.language}`,
        formData
      );
    } else {
      const addActivity = await axios.post(
        `${process.env.REACT_APP_BACKEND}/activities`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log(addActivity.data);
    }

    // Reset
    setTitle("");
    setImageFile(null);
    setEditingId(null);
    setOpenModal(false);
    setUploading(false);
    loadActivities();
  };

  const handleEdit = (activity) => {
    setTitle(activity.title);
    setEditingId(activity.id);
    setImageFile(null);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const deleteRes = await axios.delete(`${process.env.REACT_APP_BACKEND}/activities/${id}`);
      if (deleteRes.status == 204) {
        setActivities((prev) => prev.filter((a) => a.id !== id));
        setError(null);
      }
    } catch (err) {
      // Check to see if there are articles in the activity.
      if (err.response.status == 409) {
        setError("This activity has articles that must be remove first.");
      } else {
        setError("Delete failed. Please try again", err);
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex((a) => a.id === active.id);
    const newIndex = activities.findIndex((a) => a.id === over.id);

    const newActivities = arrayMove(activities, oldIndex, newIndex).map((a, idx) => ({
      ...a,
      display_order: idx + 1,
    }));

    setActivities(newActivities);

    try {
      await Promise.all(
        newActivities.map((a) =>
          axios.put(`${process.env.REACT_APP_BACKEND}/activities/${a.id}`, {
            display_order: a.display_order,
          })
        )
      );
    } catch (err) {
      console.error("Failed to update display order:", err);
    }
  };

  return (
    <MKBox>
      <MKBox display="flex" flexDirection="column" gap={2}>
        {error && (
          <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError(null)}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        <MKButton
          color="success"
          sx={{ float: "right", maxWidth: 250, mr: 5, mt: 2 }}
          onClick={() => setOpenModal(true)}
        >
          <Add sx={{ mr: 1, mb: 0.3 }} />
          Add new activity
        </MKButton>
      </MKBox>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1rem",
              margin: "2rem 0",
            }}
          >
            {activities.length > 0 &&
              activities.map((a) => (
                <SortableItem key={a.id} id={a.id}>
                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "1rem",
                      background: "#fff",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <img
                        src={a.image}
                        alt={a.title}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <h4 style={{ margin: "0 0 0.5rem", textAlign: "center" }}>{a.title}</h4>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <MKButton color="secondary" onClick={() => handleEdit(a)}>
                        Edit
                      </MKButton>
                      <MKButton color="error" onClick={() => handleDelete(a.id)}>
                        Delete
                      </MKButton>
                    </div>
                  </div>
                </SortableItem>
              ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <h3>{editingId ? "Edit Activity" : "Add New Activity"}</h3>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          <MKButton onClick={handleSave} color="info" disabled={uploading}>
            {uploading ? "Saving..." : editingId ? "Update" : "Save"}
          </MKButton>
        </Box>
      </Modal>
    </MKBox>
  );
}

export default ActivityEditor;
