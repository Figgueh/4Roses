// Base imports
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import ButtonBase from "@mui/material/ButtonBase";
import { Add, Edit, Remove, Save } from "@mui/icons-material";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
import MKInput from "components/MKInput";

// Custom components
import BaseLayout from "..";

// Database interactions
import { UserAuth } from "connection/auth/authContext";
import { saveArticleById } from "connection/articles/saveArticleById";
import { uploadImage } from "connection/images/uploadImage";
import { removeImage } from "connection/images/removeImage";
import { updateArticleImage } from "connection/articles/updateArticleImage";

// Utility
import { trimImagePathNoSize } from "utils";
import { getAllUserInfo } from "connection/users/getAllUserInfo";

/*
 * ActivityLayout is the boilerplate template for all of the activities that are around
 * the rental property.
 *
 * This component has the ability to also make changes when an admin is logged in, The title,
 * image, content and details of the article are all customizable.
 */
function ActivityLayout({ breadcrumb, title, item, setItem }) {
  const { session, authLoading } = UserAuth();
  const [account, setAccount] = useState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedArticle, setEditedArticle] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [openPicture, setOpenPicture] = useState(); //The picture that is currently in previewImage

  // If the article changes, then update the edited version
  useEffect(() => {
    const defaultArticle = {
      title: "",
      photo: "",
      article: [],
    };

    setEditedArticle(item || defaultArticle);
  }, [item]);

  const handleEditMode = () => {
    if (isEditMode) setIsEditMode(false);
    else setIsEditMode(true);
    // Clear any edits made
    setEditedArticle(item);
  };

  const handleSave = async () => {
    let updatedArticle = { ...editedArticle };

    // If a new image was uploaded, update editedArticle (wait for it)
    if (openPicture) {
      const filePath = `articles/${openPicture.name}`;
      await uploadImage(filePath, openPicture);
      await removeImage(trimImagePathNoSize(editedArticle.photo));
      await updateArticleImage(item.id, filePath);

      updatedArticle = {
        ...updatedArticle,
        photo: process.env.REACT_APP_SUPABASE_IMAGE + filePath,
      };

      setEditedArticle(updatedArticle); // for future state sync
    }

    // Save article content
    await saveArticleById(item.id, updatedArticle.title, updatedArticle.article);

    // Update final `item` to sync with parent
    setItem(updatedArticle);
    setPreviewImage(null);
    setIsEditMode(false);
  };

  // Set the preview for the image
  const handleImageUploadChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setOpenPicture(file);
    setPreviewImage(previewURL);
  };

  useEffect(() => {
    console.log("editedArticle updated:", editedArticle);
  }, [editedArticle]);

  useEffect(() => {
    console.log("item updated:", item);
  }, [item]);

  const changeArticle = (index, part, value, detailIndex = null) => {
    setEditedArticle((prev) => {
      if (!prev || !Array.isArray(prev.article)) return prev;

      const newArticle = prev.article.map((section, i) => {
        if (i !== index) return section;

        // If updating a nested detail value
        if (detailIndex !== null && Array.isArray(section[part])) {
          const newDetail = [...section[part]];
          newDetail[detailIndex] = value;
          return { ...section, [part]: newDetail };
        }

        // Otherwise, update normal field
        return { ...section, [part]: value };
      });

      return { ...prev, article: newArticle };
    });
  };

  const addDetail = (index) => {
    setEditedArticle((prev) => {
      if (!prev || !Array.isArray(prev.article)) return prev;

      const newArticle = prev.article.map((section, i) => {
        if (i !== index) return section;

        const newDetail = [...(section.detail || []), ""];
        return { ...section, detail: newDetail };
      });

      return { ...prev, article: newArticle };
    });
  };

  const removeDetail = (sectionIndex) => {
    setEditedArticle((prev) => {
      if (!prev || !Array.isArray(prev.article)) return prev;

      const newArticle = prev.article.map((section, i) => {
        if (i !== sectionIndex || !Array.isArray(section.detail)) return section;

        const newDetail = section.detail.filter(
          (_, dIndex) => dIndex !== section.detail.length - 1
        );
        return { ...section, detail: newDetail };
      });

      return { ...prev, article: newArticle };
    });
  };

  useEffect(() => {
    // check to see if the user is signed in as admin.
    if (authLoading) {
      return;
    }

    // Not just a simple isAdmin check since there are future plans to add testimonials
    const statusCheck = async () => {
      setAccount(await getAllUserInfo(session.user.id));
    };
    if (session?.user?.id) {
      statusCheck();
    }
  }, [authLoading, session?.user?.id]);

  return (
    <BaseLayout breadcrumb={breadcrumb} title={title}>
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
            {/* Image */}
            <MKBox
              component="img"
              src={editedArticle.photo} // editedArticle has to be the src here to allow updated after save.
              borderRadius="lg"
              shadow="lg"
              style={{ float: "right" }}
              sx={{
                width: { xs: "100%", md: "50%" },
                marginRight: { md: 2 },
                marginLeft: { md: 2 },
                marginTop: { md: 2 },
              }}
            />
            {Object.values(item.article).map((section, index) => (
              <MKBox key={index} sx={{ m: 2 }}>
                <MKTypography variant="h3" pb={1.5} sx={{ textDecoration: "bold" }}>
                  {section?.title}
                </MKTypography>
                <MKTypography variant="body1"> {section?.content} </MKTypography>
                {section?.detail && (
                  <MKTypography component="ul">
                    {Object.values(section.detail).map((val, index) => (
                      <MKTypography key={index} component="li" ml={3}>
                        {val}
                      </MKTypography> //Close for the list item
                    ))}
                  </MKTypography> //Close for the unordered list
                )}
              </MKBox> //Close for the content of the page
            ))}
            {account?.is_admin && (
              <MKButton
                startIcon={<Edit />}
                color="secondary"
                variant="outlined"
                sx={{ float: "right" }}
                onClick={handleEditMode}
              >
                Edit post
              </MKButton>
            )}
          </MKBox>
        ) : (
          // Admin is editing
          <MKBox sx={{ flex: 1 }}>
            <MKInput
              value={editedArticle.title}
              onChange={(e) => setEditedArticle((prev) => ({ ...prev, title: e.target.value }))}
              type="title"
              label="Title"
              m={2}
              fullWidth
              InputProps={{
                sx: {
                  input: {
                    fontSize: "2.25rem",
                    fontWeight: 600,
                    textAlign: "center",
                  },
                },
              }}
            >
              {editedArticle.title}
            </MKInput>

            {/* Image */}
            <ButtonBase
              component="label"
              tabIndex={-1}
              aria-label="article image"
              sx={{
                display: "inline-block",
                float: "right",
                maxWidth: { xs: "100%", md: "50%" },
                m: { xs: 0, md: 2 },
                p: 0,
                overflow: "hidden",
              }}
            >
              <MKBox
                component="img"
                src={previewImage || editedArticle.photo}
                borderRadius="lg"
                shadow="lg"
                sx={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />

              <input
                type="file"
                accept="image/*"
                style={{
                  border: 0,
                  clip: "rect(0 0 0 0)",
                  height: "1px",
                  margin: "-1px",
                  overflow: "hidden",
                  padding: 0,
                  position: "absolute",
                  whiteSpace: "nowrap",
                  width: "1px",
                }}
                onChange={handleImageUploadChange}
              />
            </ButtonBase>

            {/* Article sections */}
            {editedArticle.article &&
              Object.values(editedArticle.article).map((section, articleIndex) => (
                <MKBox
                  key={articleIndex}
                  sx={{ m: 2, display: "flex", flexDirection: "row", flexWrap: "wrap" }}
                >
                  {/* Section title */}
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
                  >
                    {section?.title}
                  </MKInput>
                  {/* Buttons to add or remove a detail */}
                  {articleIndex != 0 && (
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

                  {/* Section content */}
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
                    sx={{
                      width: "100%",
                    }}
                  />
                  {section?.detail && (
                    <MKTypography component="ul" width="100%">
                      {Object.values(section.detail).map((val, index) => (
                        <MKTypography key={index} component="li" ml={3}>
                          <MKInput
                            value={val}
                            fullWidth
                            onChange={(e) =>
                              changeArticle(articleIndex, "detail", e.target.value, index)
                            }
                          />
                        </MKTypography> //Close for the list item
                      ))}
                    </MKTypography> //Close for the unordered list
                  )}
                </MKBox> //Close for the content of the page
              ))}
            {account?.is_admin && (
              <MKBox>
                <MKButton
                  startIcon={<Edit />}
                  color="secondary"
                  variant="outlined"
                  sx={{ float: "right" }}
                  onClick={handleEditMode}
                >
                  {isEditMode ? "Cancel Edit" : "Edit post"}
                </MKButton>
                <MKButton
                  startIcon={<Save />}
                  color="secondary"
                  variant="outlined"
                  sx={{ float: "right", mr: 2 }}
                  onClick={handleSave}
                >
                  Save
                </MKButton>
              </MKBox>
            )}
          </MKBox>
        )}
      </Card>
    </BaseLayout>
  );
}

// Typechecking props for the BaseLayout
ActivityLayout.propTypes = {
  breadcrumb: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])).isRequired,
  title: PropTypes.string.isRequired,
  item: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    photo: PropTypes.string,
    article: PropTypes.array,
    url: PropTypes.string,
  }).isRequired,
  setItem: PropTypes.func.isRequired,
};

export default ActivityLayout;
