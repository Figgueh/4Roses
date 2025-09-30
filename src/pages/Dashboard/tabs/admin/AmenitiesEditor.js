import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// MK components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
// import { trimImagePathNoSize } from "utils";

function AmenitiesEditor() {
  const [amenities, setAmenities] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: null,
    isSmall: false,
  });

  // Fetch amenities
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/amenities`);
        setAmenities(data);
      } catch (err) {
        console.error("Error fetching amenities:", err);
      }
    };
    fetchAmenities();
  }, []);

  const handleOpen = (amenity = null) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setForm({
        title: amenity.title || "",
        description: amenity.description || "",
        image_url: amenity.image_url || "",
        isSmall: amenity.small ?? false,
      });
    } else {
      setEditingAmenity(null);
      setForm({ title: "", description: "", image_url: "", small: false });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setForm((prev) => ({ ...prev, isSmall: e.target.checked }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const resizeAmenityImage = (amenity) => ({
    ...amenity,
    image_url: !amenity.small
      ? `${process.env.REACT_APP_IMGIX}/amenities/${amenity.image_url}?w=250&h=200&fit=crop&auto=format`
      : `${process.env.REACT_APP_IMGIX}/amenities/${amenity.image_url}?w=50`,
  });

  const updateAmenityState = (data, isEdit, editingId) => {
    setAmenities((amenity) => {
      if (isEdit) {
        return amenity.map((edited) =>
          edited.id == editingId ? resizeAmenityImage(data) : edited
        );
      } else {
        return [...amenity, resizeAmenityImage(data)];
      }
    });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("isSmall", form.isSmall);
      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingAmenity) {
        const res = await axios.put(
          `${process.env.REACT_APP_BACKEND}/amenities/${editingAmenity.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        updateAmenityState(res.data, true, editingAmenity.id);
      } else {
        const res = await axios.post(`${process.env.REACT_APP_BACKEND}/amenities`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updateAmenityState(res.data, false);
      }
      handleClose();
    } catch (err) {
      console.error("Error saving amenity:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND}/amenities/${id}`);
      setAmenities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting amenity:", err);
    }
  };

  return (
    <MKBox p={3}>
      <MKTypography variant="h4" mb={2}>
        Amenities Editor
      </MKTypography>
      <MKButton variant="gradient" color="info" onClick={() => handleOpen()}>
        Add Amenity
      </MKButton>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ "& .MuiTableCell-root": { display: "table-cell" } }}>
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell align="left">Title</TableCell>
              <TableCell align="left">Description</TableCell>
              <TableCell align="center">Image</TableCell>
              <TableCell align="center">Small?</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {amenities?.map((amenity) => (
              <TableRow key={amenity.id}>
                <TableCell>{amenity.title}</TableCell>
                <TableCell>{amenity.description}</TableCell>
                <TableCell>
                  {amenity.image && (
                    <img
                      src={amenity.image}
                      alt={amenity.title}
                      width="80"
                      style={{ borderRadius: "8px" }}
                    />
                  )}
                </TableCell>
                <TableCell>{amenity.small ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(amenity)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(amenity.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{editingAmenity ? "Edit Amenity" : "Add Amenity"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={3}
          />
          <MKBox mt={2}>
            <MKTypography variant="body1" mb={1}>
              Image
            </MKTypography>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {form.image_url && (
              <MKBox mt={1}>
                <img
                  src={form.image_url}
                  alt="Current"
                  width="80"
                  style={{ borderRadius: "8px" }}
                />
              </MKBox>
            )}
          </MKBox>
          <MKBox display="flex" alignItems="center" mt={2}>
            <MKTypography variant="body1" mr={1}>
              Small?
            </MKTypography>
            <Switch checked={form.isSmall} onChange={handleSwitchChange} />
          </MKBox>
        </DialogContent>
        <DialogActions>
          <MKButton variant="text" color="secondary" onClick={handleClose}>
            Cancel
          </MKButton>
          <MKButton variant="gradient" color="info" onClick={handleSave}>
            Save
          </MKButton>
        </DialogActions>
      </Dialog>
    </MKBox>
  );
}

export default AmenitiesEditor;
