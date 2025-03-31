// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

import MKTypography from "components/MKTypography";
import MKBox from "components/MKBox";

import BaseLayout from "..";

import Card from "@mui/material/Card";

function ActivityLayout({ breadcrumb, title, children, items }) {
  return (
    <BaseLayout breadcrumb={breadcrumb} title={title}>
      {children && { children }}
      {items.map((item) => (
        <Card
          key={item.url}
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
          <MKBox sx={{ flex: 1 }}>
            <MKTypography variant="h1" textAlign="center" m={2}>
              {item.name}
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
            {Object.values(item.article).map((section) => (
              <MKBox key={section.title} sx={{ m: 2 }}>
                <MKTypography variant="h3" pb={1.5} sx={{ textDecoration: "bold" }}></MKTypography>
                <MKTypography variant="body1"> {section.content} </MKTypography>
                {section.detail && (
                  <MKTypography component="ul">
                    {Object.values(section.detail).map((val) => (
                      <MKTypography key={val} component="li" ml={3}>
                        {val}
                      </MKTypography> //Close for the list item
                    ))}
                  </MKTypography> //Close for the unordered list
                )}
              </MKBox> //Close for the content of the page
            ))}
          </MKBox>
        </Card>
      ))}
    </BaseLayout>
  );
}

// Typechecking props for the BaseLayout
ActivityLayout.propTypes = {
  breadcrumb: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])).isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])).isRequired,
};

export default ActivityLayout;
