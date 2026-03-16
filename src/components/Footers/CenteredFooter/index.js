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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

// @mui icons and other icons
import FacebookIcon from "@mui/icons-material/Facebook";
import YoutubeIcon from "@mui/icons-material/YouTube";
import BookIcon from "@mui/icons-material/Hotel";
import Vrbo from "assets/images/logos/gray-logos/small_vrbo.ico";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

import { useTranslation } from "react-i18next";

function CenteredFooter({ company, links, socials, light }) {
  const { href, name } = company;
  const { t } = useTranslation();

  const year = new Date().getFullYear();

  const defaultLinks = links ?? [
    { href: "/", name: t("home").charAt(0).toUpperCase() + t("home").slice(1) },
    { href: "/AboutUs", name: t("About Us") },
    { href: "/albums/interior", name: t("Interior photos") },
    { href: "/albums/exterior", name: t("Exterior photos") },
    { href: "/albums/videos", name: t("Watch videos") },
    { href: "/terms-and-conditions", name: t("Terms & conditions") },
  ];

  const renderLinks = defaultLinks.map((link) => (
    <MKTypography
      key={link.name}
      component={Link}
      href={link.href}
      variant="body2"
      color={light ? "white" : "secondary"}
      fontWeight="regular"
    >
      {link.name}
    </MKTypography>
  ));

  const renderSocials = socials.map((social) => (
    <MKTypography
      key={social.link}
      component={Link}
      href={social.link}
      variant="body2"
      color={light ? "white" : "secondary"}
      fontWeight="regular"
    >
      {social.icon}
    </MKTypography>
  ));

  return (
    <MKBox component="footer" py={6}>
      <Grid container justifyContent="center">
        <Grid item xs={10} lg={8}>
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            spacing={{ xs: 2, lg: 3, xl: 6 }}
            mb={3}
          >
            {renderLinks}
          </Stack>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Stack display="flex" direction="row" justifyContent="center" spacing={3} mt={1} mb={3}>
            {renderSocials}
          </Stack>
        </Grid>
        <Grid item xs={12} lg={8} sx={{ textAlign: "center" }}>
          <MKTypography variant="body2" color={light ? "white" : "secondary"}>
            {t("Copyright")} &copy; {year} {t("Material by")}{" "}
            <MKTypography
              component={Link}
              href={href}
              target="_blank"
              rel="noreferrer"
              variant="body2"
              color={light ? "white" : "secondary"}
            >
              {name}
            </MKTypography>
            .
          </MKTypography>
        </Grid>
      </Grid>
    </MKBox>
  );
}

// Setting default values for the props of CenteredFooter
CenteredFooter.defaultProps = {
  company: { href: "/AboutUs", name: "Joaquim & Aurora" },
  links: null,
  socials: [
    {
      icon: <FacebookIcon fontSize="small" />,
      link: "https://www.facebook.com/maria.aurora.abrantes",
    },
    {
      icon: <YoutubeIcon fontSize="small" />,
      link: "https://www.youtube.com/@joaquimfigueiras8377",
    },
    {
      icon: <BookIcon />,
      link: "/book",
    },
    {
      icon: <img src={Vrbo} alt="Vrbo icon" />,
      link: "https://www.vrbo.com/2905236?dateless=true",
    },
  ],
  light: false,
};

// Typechecking props for the CenteredFooter
CenteredFooter.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])),
  socials: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object])),
  light: PropTypes.bool,
};

export default CenteredFooter;
