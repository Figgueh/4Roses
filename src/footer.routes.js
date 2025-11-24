// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import BookIcon from "@mui/icons-material/Hotel";

// Material Kit 2 React components
import MKTypography from "components/MKTypography";

// Images
import logo from "assets/images/small-logos/4RosesHeader.png";

const date = new Date().getFullYear();

export default {
  brand: {
    name: "",
    image: logo,
    route: "/",
  },
  socials: [
    {
      icon: <FacebookIcon />,
      link: "https://www.facebook.com/maria.aurora.abrantes",
    },
    {
      icon: <YouTubeIcon />,
      link: "https://www.youtube.com/@joaquimfigueiras8377",
    },
    {
      icon: <BookIcon fontSize="small" />,
      link: "https://www.vrbo.com/2905236?dateless=true",
    },
  ],
  menus: [
    {
      name: "company",
      items: [
        { name: "about our property", href: "/pages/landing-pages/AboutUs" },
        { name: "about us", href: "/pages/landing-pages/AboutUs" },
        { name: "Contact us", href: "/pages/landing-pages/AboutUs/#contactUs", isHashLink: true },
      ],
    },
    {
      name: "Albums",
      items: [
        { name: "interior album", href: "pages/albums/interior" },
        { name: "exterior album", href: "pages/albums/exterior" },
        { name: "video album", href: "pages/albums/videos" },
      ],
    },
    {
      name: "help & support",
      items: [{ name: "contact developer", href: "contact-developer" }],
    },
    {
      name: "legal",
      items: [
        { name: "terms & conditions", href: "terms-and-conditions" },
        { name: "Website Design licenses", href: "https://www.creative-tim.com/license" },
      ],
    },
  ],
  copyright: (
    <MKTypography variant="button" fontWeight="regular">
      All rights reserved. Copyright &copy; {date} Four Roses by{" "}
      <MKTypography
        component="a"
        href="https://www.facebook.com/joaquim.figueiras.58"
        target="_blank"
        rel="noreferrer"
        variant="button"
        fontWeight="regular"
      >
        Joaquim{" "}
      </MKTypography>
      and
      <MKTypography
        component="a"
        href="https://www.facebook.com/profile.php?id=100010645982057"
        target="_blank"
        rel="noreferrer"
        variant="button"
        fontWeight="regular"
      >
        {" "}
        Aurora{" "}
      </MKTypography>
      Figueiras.
      <MKTypography variant="button" fontWeight="regular" display="block">
        Built by{" "}
        <MKTypography
          component="a"
          href="https://www.linkedin.com/in/alexanderfigueiras/"
          target="_blank"
          rel="noreferrer"
          variant="button"
          fontWeight="regular"
        >
          Alexander Figueiras
        </MKTypography>
      </MKTypography>
    </MKTypography>
  ),
};
