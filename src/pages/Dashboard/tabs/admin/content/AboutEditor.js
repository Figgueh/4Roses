import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import {
  SaveOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const serif = "'Cormorant Garamond', serif";
const brown = "#8b4513";
const brownLight = "#7a3c10";
const border = "1px solid #ede5db";
const bg = "#fdf8f3";

const DEFAULT_SECTIONS = [
  { heading: "The Villa", body: "" },
  { heading: "Location", body: "" },
  { heading: "Things To Do", body: "" },
  { heading: "Beaches", body: "" },
  { heading: "Getting Here", body: "" },
];

export default function AboutEditor() {
  const { i18n } = useTranslation();
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [backup, setBackup] = useState(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState({});
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_BACKEND}/about`);
        if (data && data.length > 0) {
          setSections(data);
          setBackup(data);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  useEffect(() => {
    const loadTranslation = async () => {
      const sectionsRequest = await axios.get(
        `${process.env.REACT_APP_BACKEND}/about?lang=${i18n.language}`
      );
      setSections(sectionsRequest.data);
      setBackup(sectionsRequest.data);
      setLoading(false);
    };

    loadTranslation();
  }, [i18n.language]);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleChange = (id, field, value) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const handleSave = async (id) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND}/about/${id}?lang=${i18n.language}&toTranslate=${autoTranslate}`,
        {
          heading: section.heading,
          body: section.body,
        }
      );
      setBackup((prev) => prev.map((s) => (s.id === id ? { ...section } : s)));
      setMessage(`"${section.heading}" saved successfully.`);
      setError("");

      // Send the image:
      const sectionIndex = sections.findIndex((sec) => sec.id === id);
      if (pendingImage && sectionIndex === 0) {
        const formData = new FormData();
        // Force the filename to always be "aboutUs" + original extension
        const ext = pendingImage.name.split(".").pop();
        const renamedFile = new File([pendingImage], `aboutUs.${ext}`, { type: pendingImage.type });
        formData.append("image", renamedFile);

        await axios.put(`${process.env.REACT_APP_BACKEND}/about/aboutImage`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setPendingImage(null);
      }
    } catch {
      setError(`Failed to save "${section.heading}".`);
      setSections((prev) => prev.map((s) => (s.id === id ? backup.find((b) => b.key === id) : s)));
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDiscard = (id) => {
    const original = backup.find((s) => s.id === id);
    if (original) setSections((prev) => prev.map((s) => (s.id === id ? { ...original } : s)));
  };

  const isDirty = (id) => {
    const current = sections.find((s) => s.id === id);
    const original = backup.find((s) => s.id === id);
    return current?.heading !== original?.heading || current?.body !== original?.body;
  };

  if (loading) {
    return (
      <MKBox display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
        <CircularProgress sx={{ color: brown }} />
      </MKBox>
    );
  }

  return (
    <MKBox p={{ xs: 2, md: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: serif,
            fontSize: { xs: "24px", md: "32px" },
            fontWeight: 600,
            color: "#1e1612",
            mb: 0.5,
          }}
        >
          About Page Editor
        </Typography>
        <Typography variant="body2" sx={{ color: "#9e8a80" }}>
          Edit the heading and body text for each section shown on the About component
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, borderRadius: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" onClose={() => setMessage("")} sx={{ mb: 2, borderRadius: 2 }}>
          <AlertTitle>Saved</AlertTitle>
          {message}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sections.map((s, i) => {
          const dirty = isDirty(s.id);
          const open = expanded[s.id] ?? false;

          return (
            <Box
              key={s.id}
              sx={{
                background: "#fff",
                border: dirty ? "1px solid #e8c4a8" : border,
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: dirty
                  ? "0 2px 16px rgba(139,69,19,0.10)"
                  : "0 2px 12px rgba(139,69,19,0.05)",
                transition: "box-shadow 0.2s, border-color 0.2s",
              }}
            >
              {/* Card header — click to expand */}
              <Box
                onClick={() => toggleExpand(s.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 3,
                  py: 2,
                  background: open ? bg : "#fff",
                  borderBottom: open ? border : "none",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": { background: bg },
                  transition: "background 0.15s",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography
                    sx={{
                      fontFamily: serif,
                      fontSize: "11px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#c8b8b0",
                      minWidth: 24,
                    }}
                  >
                    0{i + 1}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: serif,
                      fontSize: "20px",
                      fontWeight: 600,
                      color: dirty ? brown : "#2c2420",
                    }}
                  >
                    {s.heading}
                  </Typography>
                  {dirty && (
                    <Box
                      sx={{
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: brown,
                        background: "#fdf0e8",
                        border: "1px solid #e8c4a8",
                        borderRadius: 1,
                        px: 1,
                        py: 0.2,
                      }}
                    >
                      Unsaved
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EditOutlined sx={{ fontSize: 16, color: "#b0978a" }} />
                  {open ? (
                    <ExpandLessOutlined sx={{ fontSize: 20, color: "#9e8a80" }} />
                  ) : (
                    <ExpandMoreOutlined sx={{ fontSize: 20, color: "#9e8a80" }} />
                  )}
                </Box>
              </Box>

              {/* Editor body */}
              <Collapse in={open}>
                <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
                  {/* Heading field */}
                  <Typography
                    sx={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9e8a80",
                      mb: 0.75,
                    }}
                  >
                    Section Heading
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={s.heading}
                    onChange={(e) => handleChange(s.id, "heading", e.target.value)}
                    sx={{
                      mb: 2.5,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontFamily: serif,
                        fontSize: "16px",
                        "&.Mui-focused fieldset": { borderColor: brown },
                      },
                    }}
                  />

                  {/* Body field */}
                  <Typography
                    sx={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9e8a80",
                      mb: 0.75,
                    }}
                  >
                    Body Text
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    value={s.body}
                    onChange={(e) => handleChange(s.id, "body", e.target.value)}
                    sx={{
                      mb: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        fontSize: "14px",
                        lineHeight: 1.7,
                        "&.Mui-focused fieldset": { borderColor: brown },
                      },
                    }}
                  />
                  <Typography
                    sx={{ fontSize: "11px", color: "#b0978a", mb: 2.5, textAlign: "right" }}
                  >
                    {s.body.length} characters
                  </Typography>
                  {i === 0 && (
                    <>
                      <Typography
                        sx={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#9e8a80",
                          mb: 0.75,
                        }}
                      >
                        Hero Image
                      </Typography>

                      <Box
                        onClick={() => document.getElementById("hero-image-input").click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragging(false);
                          const file = e.dataTransfer.files[0];
                          if (file?.type.startsWith("image/")) {
                            if (imagePreview) URL.revokeObjectURL(imagePreview);
                            setPendingImage(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        sx={{
                          mb: 1.5,
                          height: imagePreview ? 180 : 110,
                          border: dragging ? `2px dashed ${brown}` : "2px dashed #d4c2b8",
                          borderRadius: 2.5,
                          background: dragging ? "#fdf0e8" : imagePreview ? "#000" : bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          overflow: "hidden",
                          position: "relative",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: brown,
                            background: imagePreview ? "#000" : "#fdf0e8",
                          },
                        }}
                      >
                        {imagePreview ? (
                          <>
                            <Box
                              component="img"
                              src={imagePreview}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                opacity: 0.8,
                              }}
                            />
                            <Typography
                              sx={{
                                position: "absolute",
                                fontSize: "11px",
                                color: "#fff",
                                background: "rgba(0,0,0,0.45)",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              Click or drag to replace
                            </Typography>
                          </>
                        ) : (
                          <Box sx={{ textAlign: "center", pointerEvents: "none" }}>
                            <Typography sx={{ fontSize: "22px", mb: 0.5 }}>🖼️</Typography>
                            <Typography sx={{ fontSize: "12px", color: "#9e8a80" }}>
                              Drag & drop or{" "}
                              <span style={{ color: brown, fontWeight: 600 }}>browse</span>
                            </Typography>
                            <Typography sx={{ fontSize: "10px", color: "#b0978a", mt: 0.3 }}>
                              JPG, PNG, WEBP
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {pendingImage && (
                        <Typography sx={{ fontSize: "11px", color: "#9e8a80", mb: 1.5 }}>
                          📎 {pendingImage.name} ({(pendingImage.size / 1024 / 1024).toFixed(2)} MB)
                          — will upload on Save
                        </Typography>
                      )}

                      <input
                        id="hero-image-input"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          // Revoke old preview URL to avoid memory leak
                          if (imagePreview) URL.revokeObjectURL(imagePreview);

                          setPendingImage(file);
                          setImagePreview(URL.createObjectURL(file));

                          // Reset input so selecting the same file again still fires onChange
                          e.target.value = "";
                        }}
                      />
                    </>
                  )}
                  {/* Actions */}

                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    {/* Only show when editing English */}
                    {i18n.language === "en" && (
                      <Box
                        onClick={() => setAutoTranslate((prev) => !prev)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          cursor: "pointer",
                          userSelect: "none",
                          opacity: dirty ? 1 : 0.35,
                          pointerEvents: dirty ? "auto" : "none",
                          transition: "opacity 0.2s",
                        }}
                      >
                        {/* Pill track */}
                        <Box
                          sx={{
                            width: 36,
                            height: 20,
                            borderRadius: "10px",
                            background: autoTranslate ? brown : "#d6cbc4",
                            position: "relative",
                            flexShrink: 0,
                            transition: "background 0.25s ease",
                            border: "1px solid",
                            borderColor: autoTranslate ? brown : "#c8b8b0",
                          }}
                        >
                          {/* Thumb */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: "2px",
                              left: autoTranslate ? "17px" : "2px",
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: "#fff",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                              transition: "left 0.25s ease",
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "11px",
                              fontWeight: 600,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: autoTranslate ? brown : "#9e8a80",
                              lineHeight: 1,
                              transition: "color 0.2s",
                            }}
                          >
                            Auto-translate
                          </Typography>
                          <Typography sx={{ fontSize: "10px", color: "#b0978a", mt: 0.3 }}>
                            All languages
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {dirty && (
                      <MKButton
                        size="small"
                        variant="outlined"
                        onClick={() => handleDiscard(s.id)}
                        sx={{
                          fontSize: "11px",
                          color: "#9e8a80",
                          borderColor: "#ede5db",
                          "&:hover": { borderColor: "#b0978a", background: bg },
                        }}
                      >
                        Discard
                      </MKButton>
                    )}
                    <MKButton
                      size="small"
                      disableRipple
                      disableTouchRipple
                      onClick={() => handleSave(s.id)}
                      disabled={saving[s.id] || (!dirty && pendingImage == null)}
                      sx={{
                        fontSize: "11px",
                        background: dirty ? brown : "#e0d5cc",
                        color: "#fff",
                        "&:hover": { background: brownLight },
                        "&:focus": { background: dirty ? brown : "#e0d5cc" },
                        "&:active": { background: brownLight },
                        "&.Mui-disabled": { background: "#e0d5cc", color: "#b0978a" },
                      }}
                      startIcon={
                        saving[s.id] ? (
                          <CircularProgress size={12} sx={{ color: "#fff" }} />
                        ) : (
                          <SaveOutlined sx={{ fontSize: "14px !important" }} />
                        )
                      }
                    >
                      {saving[s.id] ? "Saving…" : "Save"}
                    </MKButton>
                  </Box>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </MKBox>
  );
}
