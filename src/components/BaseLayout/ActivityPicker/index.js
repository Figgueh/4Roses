import { useEffect, useState } from "react";

import React from "react";
import PropTypes from "prop-types";

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Custom components
import BaseLayout from "..";
import TransparentBlogCard from "components/Cards/BlogCards/TransparentBlogCard";

// Database interactions
import { UserAuth } from "connection/auth/authContext";

import { slugify } from "utils";
import { checkAdmin } from "connection/users/checkAdmin";
import NewModal from "./modal/NewModal";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ActivityLayout from "../ActivityLayout";
import { Paper } from "@mui/material";

function ActivityPicker({ breadcrumb, title, items, id }) {
  const { session, authLoading } = UserAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState(title);
  const [article, setArticle] = useState(null);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    // check to see if the user is signed in as admin.
    if (authLoading) {
      return;
    }

    const adminCheck = async () => {
      const state = await checkAdmin(session.user.id);
      setIsAdmin(state);
    };
    if (session?.user?.id) {
      adminCheck();
    }
  }, [authLoading, session?.user?.id]);

  useEffect(() => {
    if (!id) return;
    if (i18n.language != "en") {
      axios
        .get(`${process.env.REACT_APP_BACKEND}/activities/translation/${id}?lang=${i18n.language}`)
        .then((res) => {
          if (res.data?.title) setTranslatedTitle(res.data.title);
        });
    } else {
      axios.get(`${process.env.REACT_APP_BACKEND}/activities/data/${id}`).then((res) => {
        if (res.data?.title) setTranslatedTitle(res.data.title);
      });
    }
  }, [i18n.language, id]);

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
        <MKBox component="section" py={2}>
          <Container>
            <Grid container item xs={12} lg={12}>
              <MKTypography variant="h3" mb={6}>
                {t("Check out all the latest {{activity}} activities", {
                  activity: translatedTitle.toLowerCase(),
                })}
              </MKTypography>
              {isAdmin && (
                <>
                  <MKBox pl={2} pb={2}>
                    <NewModal
                      activityTitle={title}
                      onCreate={(newArticle) => setArticle(newArticle)}
                    />
                  </MKBox>

                  {article && (
                    <Paper
                      elevation={6}
                      sx={{
                        mt: 2,
                        mb: 2,
                        p: 4,
                        borderRadius: 4,
                        width: "100%",
                        minWidth: "100%",
                      }}
                    >
                      <ActivityLayout title={title} item={article} setItem={setArticle} />
                    </Paper>
                  )}
                </>
              )}
            </Grid>
            <Grid
              container
              spacing={3}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "stretch",
              }}
            >
              {items.map((item) => (
                <Grid item xs={12} sm={6} lg={3} key={item.id} sx={{ display: "flex" }}>
                  <MKBox
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      boxShadow: 1,
                      bgcolor: "transparent",
                      position: "relative",
                      overflow: "hidden",
                      p: 2,
                    }}
                  >
                    <TransparentBlogCard
                      image={item.image}
                      title={item.title}
                      description={item.description}
                      action={{
                        type: "internal",
                        route:
                          "/activities/" +
                          slugify(title) +
                          "/" +
                          slugify(item.englishTitle ?? item.title),
                        color: "info",
                        label: t("read more"),
                      }}
                    />
                  </MKBox>
                </Grid>
              ))}
            </Grid>
          </Container>
        </MKBox>
      </Card>
    </BaseLayout>
  );
}

// Typechecking props for the BaseLayout
ActivityPicker.propTypes = {
  breadcrumb: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])).isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])).isRequired,
  id: PropTypes.string.isRequired,
};

export default ActivityPicker;
