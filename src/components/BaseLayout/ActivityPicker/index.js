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

function ActivityPicker({ breadcrumb, title, items }) {
  const { session, authLoading } = UserAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
                Check out all the latest {title.toLowerCase()} activities
              </MKTypography>
              {isAdmin && (
                <MKBox pl={2}>
                  <NewModal
                    activityTitle={title}
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                  />
                </MKBox>
              )}
            </Grid>
            <Grid container spacing={3}>
              {items.map(
                (item) => (
                  console.log(item),
                  (
                    <Grid item xs={12} sm={6} lg={3} key={item.id}>
                      <TransparentBlogCard
                        image={item.photo}
                        title={item.title}
                        description={item.description}
                        action={{
                          type: "internal",
                          route: "/activities/" + slugify(title) + "/" + slugify(item.title),
                          color: "info",
                          label: "read more",
                        }}
                      />
                    </Grid>
                  )
                )
              )}
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
};

export default ActivityPicker;
