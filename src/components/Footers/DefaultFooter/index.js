/*
=========================================================
* Material Kit 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import { HashLink } from "react-router-hash-link";

function DefaultFooter({ content }) {
  const { brand, socials, menus, copyright } = content;

  return (
    <MKBox component="footer">
      <Container>
        <Grid
          container
          spacing={3}
          sx={{
            ml: { xs: 0, md: "auto" },
            mb: 3,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Grid item xs={12} md={3} sx={{ ml: { xl: "auto", md: -10 }, mb: 3 }}>
            <MKBox>
              <Link to={brand.route}>
                <MKBox
                  component="img"
                  src={brand.image}
                  alt={brand.name}
                  sx={{
                    width: "100%",
                    maxWidth: {
                      xs: 120,
                      sm: 160,
                      md: 200,
                      lg: 250,
                    },
                    height: "auto",
                  }}
                  mb={2}
                />
              </Link>
              <MKTypography variant="h6">{brand.name}</MKTypography>
            </MKBox>
            <MKBox
              display="flex"
              alignItems="center"
              mt={3}
              sx={{
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              {socials.map(({ icon, link }, key) => (
                <MKTypography
                  key={link}
                  component="a"
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  variant="h5"
                  color="dark"
                  opacity={0.8}
                  mr={key === socials.length - 1 ? 0 : 2.5}
                >
                  {icon}
                </MKTypography>
              ))}
            </MKBox>
          </Grid>
          {menus.map(({ name: title, items }) => (
            <Grid
              key={title}
              item
              xs={6}
              md={2}
              sx={{
                ml: { xs: 0, md: "auto" },
                mb: 3,
                textAlign: { xs: "center", md: "left" },
                justifyContent: { md: "flex-start" },
              }}
            >
              <MKTypography
                display="block"
                variant="button"
                fontWeight="bold"
                textTransform="capitalize"
                mb={1}
              >
                {title}
              </MKTypography>
              <MKBox component="ul" p={0} m={0} sx={{ listStyle: "none" }}>
                {items.map(({ name, route, href }) => {
                  const isHash = typeof href === "string" && href.includes("#");

                  return (
                    <MKBox key={name} component="li" p={0} m={0} mb={1} lineHeight={1.25}>
                      {href ? (
                        isHash ? (
                          <MKTypography
                            component={HashLink}
                            smooth
                            to={href}
                            variant="button"
                            fontWeight="regular"
                            textTransform="capitalize"
                          >
                            {name}
                          </MKTypography>
                        ) : (
                          <MKTypography
                            component="a"
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            variant="button"
                            fontWeight="regular"
                            textTransform="capitalize"
                          >
                            {name}
                          </MKTypography>
                        )
                      ) : (
                        <MKTypography
                          component={Link}
                          to={route}
                          variant="button"
                          fontWeight="regular"
                          textTransform="capitalize"
                        >
                          {name}
                        </MKTypography>
                      )}
                    </MKBox>
                  );
                })}
              </MKBox>
            </Grid>
          ))}
          <Grid item xs={12} sx={{ textAlign: "center", my: 3 }}>
            {copyright}
          </Grid>
        </Grid>
      </Container>
    </MKBox>
  );
}

// Typechecking props for the DefaultFooter
DefaultFooter.propTypes = {
  content: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.array])).isRequired,
};

export default DefaultFooter;
