/* eslint-disable no-unused-vars */
// Base imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import ButtonBase from "@mui/material/ButtonBase";
import { Add, Delete, Edit, Remove, Save } from "@mui/icons-material";
import { Alert, AlertTitle } from "@mui/material";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
import MKInput from "components/MKInput";
import MKProgress from "components/MKProgress";

// Custom components
import BaseLayout from "..";

// Database interactions
import { UserAuth } from "connection/auth/authContext";
import { getAllUserInfo } from "connection/users/getAllUserInfo";

// Utility
import { slugify } from "utils";
import axios from "axios";
import { useTranslation } from "react-i18next";

function ActivityLayout({ breadcrumb, title, item, setItem }) {
  const navigate = useNavigate();
  const { session, authLoading } = UserAuth();
  const [account, setAccount] = useState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedArticle, setEditedArticle] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [openPicture, setOpenPicture] = useState();
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const { i18n } = useTranslation();

  useEffect(() => {
    const defaultArticle = {
      title: "",
      image: "https://placehold.co/600x600?text=Placeholder%20image",
      content: [],
    };
    setEditedArticle(item || defaultArticle);
    console.log(item.image);
  }, [item]);

  const handleEditMode = () => {
    setIsEditMode((prev) => !prev);
    setEditedArticle(item);
  };

  const handleSave = async () => {
    let updatedArticle = { ...editedArticle };
    const formData = new FormData();

    if (openPicture) {
      const filePath = `articles/${openPicture.name}`;
      formData.append("image", openPicture);

      updatedArticle = {
        ...updatedArticle,
        image: process.env.REACT_APP_SUPABASE_IMAGE + filePath,
      };

      setEditedArticle(updatedArticle);
    }

    // Add all the data for the article
    formData.append("id", item.id);
    formData.append("title", updatedArticle.title);
    formData.append("rawContent", JSON.stringify(updatedArticle.content));
    formData.append("url", updatedArticle.url);
    formData.append("image", updatedArticle.image);
    formData.append("description", updatedArticle.description);

    try {
      var res;
      if (item.isPreview) {
        const clientId = crypto.randomUUID();
        const eventSource = new EventSource(
          `${process.env.REACT_APP_BACKEND}/articles/events?id=${clientId}`
        );

        eventSource.addEventListener("status", (e) => {
          const data = JSON.parse(e.data);
          setStatus(data.message);
        });

        eventSource.addEventListener("progress", (e) => {
          const data = JSON.parse(e.data);
          setProgress(data.progress);
          setStatus(`${data.message}`);
        });

        eventSource.addEventListener("done", () => {
          setProgress(100);
          setStatus("All translations done!");
          eventSource.close();
        });

        eventSource.onerror = () => {
          setError("Connection lost");
          eventSource.close();
        };

        formData.append("activityId", item.activityId);
        formData.append("clientId", clientId);
        res = await axios.post(`${process.env.REACT_APP_BACKEND}/articles`, formData);
      } else {
        res = await axios.put(
          `${process.env.REACT_APP_BACKEND}/articles/${item.id}?lang=${i18n.language}`,
          formData
        );
      }

      if (res.status == 200) {
        setItem(updatedArticle);
        setPreviewImage(null);
        setIsEditMode(false);

        if (breadcrumb == undefined) {
          // Is being created from activity picker.
          navigate(`/activities/${slugify(item.activityName)}/${slugify(res.data.title)}`);
        } else if (!breadcrumb.at(1).route.includes("[object Object]")) {
          // Is from a regular update.
          navigate(`${breadcrumb?.at(1).route}/${slugify(res.data.title)}`);
        } else if (window.location.pathname.includes("dashboard")) {
          // Is coming from the article builder.
          navigate(`/activities/${slugify(item.activityName)}/${slugify(res.data.title)}`);
        }
      }
    } catch (err) {
      console.error("Save error:", err);

      const message = err?.response?.data?.error || err?.message || "Unknown error occurred";

      setError(message);
    }
  };

  const handleImageUploadChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setOpenPicture(file);
    setPreviewImage(previewURL);
  };

  const changeArticle = (index, part, value, detailIndex = null) => {
    setEditedArticle((prev) => {
      if (!prev || !Array.isArray(prev.content)) return prev;

      const newArticle = prev.content.map((section, i) => {
        if (i !== index) return section;

        if (detailIndex !== null && Array.isArray(section[part])) {
          const newDetail = [...section[part]];
          newDetail[detailIndex] = value;
          return { ...section, [part]: newDetail };
        }

        return { ...section, [part]: value };
      });

      return { ...prev, content: newArticle };
    });
  };

  const handleAddSection = () => {
    setEditedArticle((prev) => ({
      ...prev,
      content: [...(prev.content || []), { title: "", content: "", detail: [] }],
    }));
  };

  const handleRemoveSection = () => {
    setEditedArticle((prev) => ({
      ...prev,
      content: (prev.content || []).slice(0, -1),
    }));
  };

  const addDetail = (index) => {
    setEditedArticle((prev) => {
      const newArticle = (prev.content || []).map((section, i) => {
        if (i !== index) return section;
        return { ...section, detail: [...(section.detail || []), ""] };
      });
      return { ...prev, content: newArticle };
    });
  };

  const removeDetail = (sectionIndex) => {
    setEditedArticle((prev) => {
      const newArticle = (prev.content || []).map((section, i) => {
        if (i !== sectionIndex || !Array.isArray(section.detail)) return section;
        return { ...section, detail: section.detail.slice(0, -1) };
      });
      return { ...prev, content: newArticle };
    });
  };

  const handleDelete = async () => {
    if (item.isPreview) return setError("Currently in preview mode, Nothing to delete.");
    const deleteResponse = await axios.delete(
      `${process.env.REACT_APP_BACKEND}/articles/${item.id}`
    );
    if (deleteResponse.status == 200) navigate(`/activities/${slugify(title)}`);
  };

  useEffect(() => {
    if (authLoading) return;
    if (session?.user?.id) {
      const statusCheck = async () => {
        setAccount(await getAllUserInfo(session.user.id));
      };
      statusCheck();
    }
  }, [authLoading, session?.user?.id]);

  // component renderer
  const renderComponent = () => (
    <>
      {account?.is_admin && !isEditMode ? (
        <MKButton
          startIcon={<Edit />}
          color="secondary"
          variant="outlined"
          sx={{ ml: 5 }}
          onClick={handleEditMode}
        >
          Edit post
        </MKButton>
      ) : (
        account?.is_admin &&
        isEditMode && (
          <MKBox
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            <MKBox display="flex" justifyContent="left">
              <MKButton
                startIcon={<Save />}
                color="secondary"
                variant="outlined"
                sx={{ mr: 2, ml: 5 }}
                onClick={handleSave}
              >
                Save
              </MKButton>
              <MKButton
                startIcon={<Edit />}
                color="secondary"
                variant="outlined"
                onClick={handleEditMode}
              >
                Cancel Edit
              </MKButton>
            </MKBox>

            <MKBox display="flex" justifyContent="center">
              <MKButton
                startIcon={<Add />}
                color="secondary"
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={handleAddSection}
              >
                Add Section
              </MKButton>
              <MKButton
                startIcon={<Remove />}
                color="secondary"
                variant="outlined"
                onClick={handleRemoveSection}
              >
                Remove Section
              </MKButton>
            </MKBox>

            <MKBox display="flex" justifyContent="right">
              <MKButton
                startIcon={<Delete />}
                color="error"
                variant="outlined"
                sx={{ float: "right", mr: 5 }}
                onClick={handleDelete}
              >
                Delete post
              </MKButton>
            </MKBox>
          </MKBox>
        )
      )}
      {error != "" && (
        <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError("")}>
          <AlertTitle>Article editor status</AlertTitle>
          {error}
        </Alert>
      )}
      {status && (
        <Alert
          sx={{
            mt: 2,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
          severity="success"
          onClose={() => setStatus(null)}
        >
          <AlertTitle>Article editor status</AlertTitle>
          {status}

          <MKProgress
            sx={{
              mt: 2,
              mb: 2,
              width: "100%",
              display: "block",
              "& .MuiLinearProgress-bar": { borderRadius: "6px", height: 10 },
              height: 10,
            }}
            color="info"
            value={progress}
          />
        </Alert>
      )}
      <Card
        sx={{
          alignItems: "flex-start",
          p: 2,
          mx: { xs: 2, lg: 3 },
          mb: 4,
          backgroundColor: ({ palette: { white }, functions: { rgba } }) => rgba(white.main, 0.8),
          backdropFilter: "saturate(200%) blur(30px)",
          boxShadow: ({ boxShadows: { xxl } }) => xxl,
        }}
      >
        {!isEditMode ? (
          <MKBox sx={{ flex: 1 }}>
            <MKTypography variant="h1" textAlign="center" m={2}>
              {item.title}
            </MKTypography>

            <MKBox
              component="img"
              src={editedArticle.image}
              borderRadius="lg"
              shadow="lg"
              style={{ float: "right" }}
              sx={{
                width: { xs: "100%", md: "50%" },
                maxWidth: 600,
                marginRight: { md: 2 },
                marginLeft: { md: 2 },
                marginTop: { md: 2 },
              }}
            />

            {/* URL viewer, aligned under the image only */}
            {(item.url || item.address) && (
              <MKBox
                sx={{
                  width: { xs: "100%", md: "50%" }, // match the image width
                  float: "right", // stay in the same column
                  mr: { md: 2 },
                  ml: { md: 2 },
                  mt: 1,
                  p: 2,
                  borderRadius: "lg",
                  backgroundColor: "#f8f9ff",
                  border: "1px solid #e0e6ff",
                  textAlign: "center",
                }}
              >
                <MKButton
                  color="info"
                  size="small"
                  variant="contained"
                  sx={{ mb: 2 }}
                  onClick={() =>
                    setEditedArticle((prev) => ({
                      ...prev,
                      showInfo: !prev.showInfo,
                    }))
                  }
                >
                  {editedArticle.showInfo ? "Hide info" : "Show info"}
                </MKButton>

                {editedArticle.showInfo && editedArticle.url && (
                  <>
                    <MKTypography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Website link:
                    </MKTypography>
                    <MKTypography
                      variant="body2"
                      component="a"
                      href={item.url.split(",")[0].trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        mt: 1.5,
                        p: 1,
                        backgroundColor: "white",
                        borderRadius: "md",
                        boxShadow: "sm",
                        textDecoration: "underline",
                        color: "info.main",
                        wordBreak: "break-all",
                      }}
                    >
                      {item.url.split(",")[0].trim()}
                    </MKTypography>
                  </>
                )}
                {editedArticle.showInfo && editedArticle.address && (
                  <>
                    <MKTypography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                      Company address:
                    </MKTypography>
                    <MKTypography
                      variant="body2"
                      component="a"
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                        "R. Júlio Amaro 33, 8500-001 Alvor, Portugal"
                      )}&destination=${encodeURIComponent(item.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        mt: 1.5,
                        p: 1,
                        backgroundColor: "white",
                        borderRadius: "md",
                        boxShadow: "sm",
                        wordBreak: "break-all",
                        color: "info.main",
                      }}
                    >
                      {item.address}
                    </MKTypography>
                  </>
                )}
              </MKBox>
            )}

            {item.content?.map((section, index) => (
              <MKBox key={index} sx={{ m: 2 }}>
                <MKTypography variant="h3" pb={1.5} sx={{ fontWeight: "bold" }}>
                  {section?.title}
                </MKTypography>
                <MKTypography variant="body1">{section?.content}</MKTypography>
                {section?.detail && (
                  <MKTypography component="ul">
                    {section.detail.map((val, index) => (
                      <MKTypography key={index} component="li" ml={3}>
                        {val}
                      </MKTypography>
                    ))}
                  </MKTypography>
                )}
              </MKBox>
            ))}
          </MKBox>
        ) : (
          <>
            {/* Title stays full width above content on the left */}
            <MKInput
              value={editedArticle.title}
              onChange={(e) => setEditedArticle((prev) => ({ ...prev, title: e.target.value }))}
              type="title"
              label="Title"
              fullWidth
              sx={{ mt: 2 }}
              InputProps={{
                sx: {
                  input: {
                    fontSize: "2.25rem",
                    fontWeight: 600,
                    textAlign: "center",
                  },
                },
              }}
            />
            <MKBox
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row-reverse" },
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              {/* ----------- RIGHT SIDE (Image + URL box) ----------- */}
              <MKBox
                sx={{
                  width: { xs: "100%", md: "45%" },
                  ml: { md: 2 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                {/* IMAGE */}
                <ButtonBase
                  component="label"
                  tabIndex={-1}
                  aria-label="article image"
                  sx={{
                    width: "100%",
                    p: 0,
                    mt: 2,
                    overflow: "hidden",
                    borderRadius: "lg",
                  }}
                >
                  <MKBox
                    component="img"
                    src={previewImage || editedArticle.image}
                    borderRadius="lg"
                    shadow="lg"
                    sx={{ width: "100%", height: "auto", display: "block" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUploadChange}
                  />
                </ButtonBase>

                {/* URL + ADDRESS */}
                <MKBox
                  sx={{
                    width: "100%",
                    mt: 2,
                    p: 2,
                    borderRadius: "lg",
                    backgroundColor: "#f8f9ff",
                    border: "1px solid #e0e6ff",
                  }}
                >
                  <MKInput
                    label="Website URL"
                    value={editedArticle.url || ""}
                    onChange={(e) =>
                      setEditedArticle((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    fullWidth
                    sx={{ mb: 2 }}
                  />

                  <MKInput
                    label="Business Address"
                    value={editedArticle.address || ""}
                    onChange={(e) =>
                      setEditedArticle((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    fullWidth
                  />
                </MKBox>
              </MKBox>

              {/* ----------- LEFT SIDE: Article Content ----------- */}
              <MKBox sx={{ width: { xs: "100%", md: "55%" }, pr: { md: 2 }, mt: { xs: 2, md: 0 } }}>
                {editedArticle?.content?.map((section, articleIndex) => (
                  <MKBox
                    key={articleIndex}
                    sx={{ m: 2, display: "flex", flexDirection: "row", flexWrap: "wrap" }}
                  >
                    <MKInput
                      type="section_title"
                      label={`Section ${articleIndex} title`}
                      value={section?.title || ""}
                      onChange={(e) => changeArticle(articleIndex, "title", e.target.value)}
                      pb={1.5}
                      InputProps={{
                        sx: {
                          mb: 2,
                          input: {
                            fontSize: "1.75rem",
                            fontWeight: 500,
                          },
                        },
                      }}
                    />

                    {articleIndex !== 0 && (
                      <MKBox mt={1.5}>
                        <MKButton
                          sx={{ ml: 2, mb: 2 }}
                          size="medium"
                          color="success"
                          variant="gradient"
                          onClick={() => addDetail(articleIndex)}
                        >
                          <Add />
                        </MKButton>
                        <MKButton
                          sx={{ ml: 2, mb: 2 }}
                          size="medium"
                          color="error"
                          variant="gradient"
                          onClick={() => removeDetail(articleIndex)}
                        >
                          <Remove />
                        </MKButton>
                      </MKBox>
                    )}

                    <MKInput
                      type="content"
                      label={`Section ${articleIndex} content`}
                      value={section?.content || ""}
                      onChange={(e) => changeArticle(articleIndex, "content", e.target.value)}
                      multiline
                      InputProps={{
                        sx: {
                          textarea: {
                            fontSize: "1rem",
                            fontWeight: 400,
                            lineHeight: 1.5,
                          },
                        },
                      }}
                      sx={{ width: "100%" }}
                    />

                    {section?.detail && (
                      <MKTypography component="ul" width="100%">
                        {section.detail.map((val, index) => (
                          <MKTypography key={index} component="li" ml={3}>
                            <MKInput
                              value={val}
                              fullWidth
                              onChange={(e) =>
                                changeArticle(articleIndex, "detail", e.target.value, index)
                              }
                            />
                          </MKTypography>
                        ))}
                      </MKTypography>
                    )}
                  </MKBox>
                ))}
              </MKBox>
            </MKBox>
          </>
        )}
      </Card>
    </>
  );

  if (item.isPreview) {
    return renderComponent();
  } else {
    return (
      <BaseLayout breadcrumb={breadcrumb} title={title}>
        {renderComponent()}
      </BaseLayout>
    );
  }
}

ActivityLayout.propTypes = {
  breadcrumb: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired,
  item: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    image: PropTypes.string,
    content: PropTypes.array,
    url: PropTypes.string,
    address: PropTypes.string,
    isPreview: PropTypes.bool,
    activityId: PropTypes.string,
    activityName: PropTypes.string,
  }).isRequired,
  setItem: PropTypes.func.isRequired,
};

export default ActivityLayout;
