import MKButton from "components/MKButton";
import { fetchActivities } from "connection/activities/fetchActivities";
import supabase from "connection/client";
import React, { useEffect, useState } from "react";
import { Modal, Box, TextField } from "@mui/material";

function ActivityEditor() {
  const [activities, setActivities] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadActivities = async () => {
    const databaseActivities = await fetchActivities();
    setActivities(databaseActivities);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleSave = async () => {
    if (!title || (editingId === null && !imageFile)) return;

    setUploading(true);
    let imageUrl = null;

    // If new image is selected, upload it
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${title}.${fileExt}`;
      const filePath = `activities/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error("Image upload failed:", uploadError.message);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    if (editingId) {
      const updates = { title };
      if (imageUrl) updates.image = imageUrl;

      const { error: updateError } = await supabase
        .from("activities")
        .update(updates)
        .eq("id", editingId);

      if (updateError) console.error("Update error:", updateError);
    } else {
      const { error: insertError } = await supabase.from("activities").insert({
        title,
        image: imageUrl,
      });

      if (insertError) console.error("Insert error:", insertError);
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
    setImageFile(null); // don't prefill old image
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) {
      console.error("Delete failed:", error.message);
    } else {
      setActivities((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div>
      <MKButton color="secondary" onClick={() => setOpenModal(true)}>
        Add new activity
      </MKButton>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
          margin: "2rem 0",
        }}
      >
        {activities.map((a) => (
          <div
            key={a.id}
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
        ))}
      </div>

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
    </div>
  );
}

export default ActivityEditor;
