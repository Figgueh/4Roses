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
      link: "https://www.facebook.com/CreativeTim/",
    },
    {
      icon: <YouTubeIcon />,
      link: "https://www.youtube.com/channel/UCVyTG4sCw-rOvB9oHkzZD1w",
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
        { name: "about us", href: "https://www.creative-tim.com/presentation" },
        { name: "freebies", href: "https://www.creative-tim.com/templates/free" },
        { name: "premium tools", href: "https://www.creative-tim.com/templates/premium" },
        { name: "blog", href: "https://www.creative-tim.com/blog" },
      ],
    },
    {
      name: "resources",
      items: [
        { name: "illustrations", href: "https://iradesign.io/" },
        { name: "bits & snippets", href: "https://www.creative-tim.com/bits" },
        { name: "affiliate program", href: "https://www.creative-tim.com/affiliates/new" },
      ],
    },
    {
      name: "help & support",
      items: [
        { name: "contact us", href: "https://www.creative-tim.com/contact-us" },
        { name: "knowledge center", href: "https://www.creative-tim.com/knowledge-center" },
        { name: "custom development", href: "https://services.creative-tim.com/" },
        { name: "sponsorships", href: "https://www.creative-tim.com/sponsorships" },
      ],
    },
    {
      name: "legal",
      items: [
        { name: "terms & conditions", href: "https://www.creative-tim.com/terms" },
        { name: "privacy policy", href: "https://www.creative-tim.com/privacy" },
        { name: "licenses (EULA)", href: "https://www.creative-tim.com/license" },
      ],
    },
  ],
  copyright: (
    <MKTypography variant="button" fontWeight="regular">
      All rights reserved. Copyright &copy; {date} 4 Roses by{" "}
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
