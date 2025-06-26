// Base imports
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import { Edit } from "@mui/icons-material";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";

// Custom components
import BaseLayout from "..";

// Database interactions
import { UserAuth } from "connection/auth/authContext";
import supabase from "connection/client";

function ActivityLayout({ breadcrumb, title, item }) {
  const { session, authLoading } = UserAuth();
  const [account, setAccount] = useState();
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditMode = () => {
    if (isEditMode) setIsEditMode(false);
    else setIsEditMode(true);
  };

  useEffect(() => {
    // check to see if the user is signed in as admin.
    if (authLoading) {
      return;
    }
    const checkAdmin = async () => {
      const { data: account, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) console.log(error);
      setAccount(account);
    };
    if (session?.user?.id) {
      checkAdmin();
    }
  }, [authLoading, session?.user?.id]);
  console.log("Updated article:", item);

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
        {!isEditMode && (
          <MKBox sx={{ flex: 1 }}>
            <MKTypography variant="h1" textAlign="center" m={2}>
              {item.title}
            </MKTypography>
            {/* Image */}
            <MKBox
              component="img"
              src={item.photo}
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
    title: PropTypes.string,
    photo: PropTypes.string,
    article: PropTypes.array,
    url: PropTypes.string,
  }).isRequired,
};

export default ActivityLayout;
