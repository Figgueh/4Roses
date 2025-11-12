/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
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

import { useTranslation } from "react-i18next";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ amenity, handleOpen, handleDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: amenity.id,
  });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    cursor: "grab",
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell>{amenity.title}</TableCell>
      <TableCell>{amenity.description}</TableCell>
      <TableCell>
        {amenity.image && (
          <img src={amenity.image} alt={amenity.title} width="80" style={{ borderRadius: "8px" }} />
        )}
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={() => handleOpen(amenity)} onPointerDown={(e) => e.stopPropagation()}>
          <EditIcon />
        </IconButton>
        <IconButton
          color="error"
          onClick={() => handleDelete(amenity.id)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function AmenitiesEditor() {
  const [amenities, setAmenities] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: null,
    image_url: "",
    preview: "",
    isSmall: false,
  });
  const { i18n } = useTranslation();

  const smallAmenities = React.useMemo(() => amenities.filter((a) => a.small), [amenities]);
  const bigAmenities = React.useMemo(() => amenities.filter((a) => !a.small), [amenities]);

  // Fetch amenities
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND}/amenities?lang=${i18n.language}`
        );
        setAmenities(data);
      } catch (err) {
        console.error("Error fetching amenities:", err);
      }
    };
    fetchAmenities();
  }, [i18n.language]);

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
      setForm({ title: "", description: "", image_url: "", isSmall: false });
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
    const file = e.target.files[0];
    setForm((prev) => ({
      ...prev,
      image: file,
      preview: file ? URL.createObjectURL(file) : "",
    }));
  };

  // const resizeAmenityImage = (amenity) => ({
  //   ...amenity,
  //   image_url: !amenity.small
  //     ? `${process.env.REACT_APP_IMGIX}/amenities/${amenity.image_url}?w=250&h=200&fit=crop&auto=format`
  //     : `${process.env.REACT_APP_IMGIX}/amenities/${amenity.image_url}?w=50`,
  // });

  const updateAmenityState = (data, isEdit) => {
    const amenity = {
      id: data.id,
      title: form.title,
      description: form.description,
      small: form.isSmall,
      display_order: data.display_order ?? 0,
      image: form.image
        ? form.preview // newly uploaded image preview
        : data.image_url
        ? `${process.env.REACT_APP_IMGIX}/amenities/${data.image_url}?w=${
            form.isSmall ? 50 : 250
          }&h=${form.isSmall ? undefined : 200}&fit=crop&auto=format`
        : null,
    };

    setAmenities((prev) => {
      if (isEdit) {
        return prev.map((a) => (a.id === amenity.id ? amenity : a));
      } else {
        return [...prev.filter((a) => a.id !== amenity.id), amenity];
      }
    });
  };
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("isSmall", form.isSmall);
      if (form.image) formData.append("image", form.image);

      if (editingAmenity) {
        const res = await axios.put(
          `${process.env.REACT_APP_BACKEND}/amenities/${editingAmenity.id}?lang=${i18n.language}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        updateAmenityState(
          { id: editingAmenity.id, display_order: editingAmenity.display_order },
          true
        );
      } else {
        const res = await axios.post(`${process.env.REACT_APP_BACKEND}/amenities`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        updateAmenityState({ id: res.data.id, display_order: res.data.display_order }, false);
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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = bigAmenities.findIndex((a) => a.id === active.id);
      const newIndex = bigAmenities.findIndex((a) => a.id === over.id);

      const newBigAmenities = arrayMove(bigAmenities, oldIndex, newIndex);

      // Update display_order
      const updatedAmenities = newBigAmenities.map((a, idx) => ({
        ...a,
        display_order: idx + 1,
      }));

      setAmenities([...updatedAmenities, ...smallAmenities]);

      try {
        await Promise.all(
          updatedAmenities.map((a) =>
            axios.put(`${process.env.REACT_APP_BACKEND}/amenities/${a.id}`, {
              display_order: a.display_order,
            })
          )
        );
      } catch (err) {
        console.error("Error updating display order:", err);
      }
    }
  };

  const handleDragEndSmall = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = smallAmenities.findIndex((a) => a.id === active.id);
      const newIndex = smallAmenities.findIndex((a) => a.id === over.id);

      const newSmallAmenities = arrayMove(smallAmenities, oldIndex, newIndex);

      // Update display_order
      const updatedAmenities = newSmallAmenities.map((a, idx) => ({
        ...a,
        display_order: idx + 1,
      }));

      setAmenities([...updatedAmenities, ...bigAmenities]);

      try {
        await Promise.all(
          updatedAmenities.map((a) =>
            axios.put(`${process.env.REACT_APP_BACKEND}/amenities/${a.id}`, {
              display_order: a.display_order,
            })
          )
        );
      } catch (err) {
        console.error("Error updating small amenities order:", err);
      }
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

      <MKTypography variant="h5" mb={1} mt={2}>
        Big Amenities
      </MKTypography>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={bigAmenities.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <TableContainer component={Paper}>
            <Table sx={{ "& .MuiTableCell-root": { display: "table-cell" } }}>
              <TableHead sx={{ display: "table-header-group" }}>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bigAmenities.map((amenity, index) => (
                  <SortableRow
                    key={amenity.id}
                    amenity={amenity}
                    index={index}
                    handleOpen={handleOpen}
                    handleDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SortableContext>
      </DndContext>

      <MKTypography variant="h5" mb={1} mt={3}>
        Small Amenities
      </MKTypography>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndSmall}>
        <SortableContext
          items={smallAmenities.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table sx={{ "& .MuiTableCell-root": { display: "table-cell" } }}>
              <TableHead sx={{ display: "table-header-group" }}>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {smallAmenities.map((amenity, index) => (
                  <SortableRow
                    key={amenity.id}
                    amenity={amenity}
                    index={index}
                    handleOpen={handleOpen}
                    handleDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SortableContext>
      </DndContext>

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
            {(form.preview || form.image_url) && (
              <MKBox mt={1}>
                <img
                  src={form.preview || form.image_url}
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
