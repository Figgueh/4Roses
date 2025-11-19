/**
=========================================================
* Material Kit 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";
import { UserAuth } from "connection/auth/authContext";

// react-router components
import { Link, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Collapse from "@mui/material/Collapse";
import MuiLink from "@mui/material/Link";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

// Material Kit 2 React example components
import DefaultNavbarDropdown from "./DefaultNavbarDropdown";

function DefaultNavbarMobile({ routes, open, actionButton, languageSelector }) {
  const navigate = useNavigate();
  const [collapse, setCollapse] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { session, signOut } = UserAuth();

  useEffect(() => {
    const init = async () => {
      // Check if the user is logged in
      if (session?.user?.id) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    init();
  }, [session]);

  const handleSignOut = async (event) => {
    event.preventDefault();
    await signOut();
    navigate("/");
  };

  const handleSetCollapse = (name) => (collapse === name ? setCollapse(false) : setCollapse(name));

  const renderNavbarItems = routes.map(
    ({ name, icon, collapse: routeCollapses, href, route, collapse: navCollapse }) => (
      <DefaultNavbarDropdown
        key={name}
        name={name}
        icon={icon}
        collapseStatus={name === collapse}
        onClick={() => handleSetCollapse(name)}
        href={href}
        route={route}
        collapse={Boolean(navCollapse)}
      >
        {/* Scrollable content only */}
        <MKBox sx={{ maxHeight: "calc(100vh - 70px)", overflowY: "auto", mt: 1 }}>
          {routeCollapses &&
            routeCollapses.map((item) => (
              <MKBox key={item.name} px={2}>
                {item.collapse ? (
                  <>
                    <MKTypography
                      display="block"
                      variant="button"
                      fontWeight="bold"
                      textTransform="capitalize"
                      py={1}
                      px={0.5}
                    >
                      {item.name}
                    </MKTypography>
                    {item.collapse
                      .filter((l) => {
                        // Remove the links that users shouldn't be able to see based on their login status
                        if (isLoggedIn) return l.id !== "sign_in" && l.id !== "register";
                        else return l.id !== "dashboard" && l.id !== "sign_out";
                      })
                      .map((el) => (
                        <MKTypography
                          key={el.name}
                          component={el.route ? Link : MuiLink}
                          to={el.route ? el.route : ""}
                          href={el.href ? el.href : ""}
                          target={el.href ? "_blank" : ""}
                          rel={el.href ? "noreferrer" : "noreferrer"}
                          minWidth="11.25rem"
                          display="block"
                          variant="button"
                          color="text"
                          textTransform="capitalize"
                          fontWeight="regular"
                          py={0.625}
                          px={2}
                          sx={({ palette: { grey, dark }, borders: { borderRadius } }) => ({
                            borderRadius: borderRadius.md,
                            cursor: "pointer",
                            transition: "all 300ms linear",
                            "&:hover": {
                              backgroundColor: grey[200],
                              color: dark.main,
                            },
                          })}
                          // Attach the signout function to the signout button
                          onClick={(event) => {
                            if (isLoggedIn && el.id === "sign_out") {
                              handleSignOut(event);
                            }
                          }}
                        >
                          {el.name}
                        </MKTypography>
                      ))}
                  </>
                ) : (
                  <MKBox
                    key={item.key}
                    display="block"
                    component={item.route ? Link : MuiLink}
                    to={item.route ? item.route : ""}
                    href={item.href ? item.href : ""}
                    target={item.href ? "_blank" : ""}
                    rel={item.href ? "noreferrer" : "noreferrer"}
                    sx={({ palette: { grey, dark }, borders: { borderRadius } }) => ({
                      borderRadius: borderRadius.md,
                      cursor: "pointer",
                      transition: "all 300ms linear",
                      py: 1,
                      px: 1.625,
                      "&:hover": {
                        backgroundColor: grey[200],
                        color: dark.main,
                        "& *": {
                          color: dark.main,
                        },
                      },
                    })}
                  >
                    <MKTypography
                      display="block"
                      variant="button"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      {item.name}
                    </MKTypography>
                    <MKTypography
                      display="block"
                      variant="button"
                      color="text"
                      fontWeight="regular"
                      sx={{ transition: "all 300ms linear" }}
                    >
                      {item.description}
                    </MKTypography>
                  </MKBox>
                )}
              </MKBox>
            ))}
        </MKBox>
      </DefaultNavbarDropdown>
    )
  );

  return (
    <Collapse in={Boolean(open)} timeout="auto" unmountOnExit>
      <MKBox width="100%" my={2}>
        {/* Top row: button on left, language on right */}
        <MKBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MKBox>{actionButton}</MKBox>
          <MKBox>{languageSelector}</MKBox>
        </MKBox>

        {/* Scrollable menu items */}
        {renderNavbarItems}
      </MKBox>
    </Collapse>
  );
}

// Typechecking props for the DefaultNavbarMobile
DefaultNavbarMobile.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])).isRequired,
  open: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
  actionButton: PropTypes.node,
  languageSelector: PropTypes.node,
};

export default DefaultNavbarMobile;
