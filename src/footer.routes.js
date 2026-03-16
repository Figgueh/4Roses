// @mui icons and other icons
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import BookIcon from "@mui/icons-material/Hotel";
import Vrbo from "assets/images/logos/gray-logos/small_vrbo.ico";

// Material Kit 2 React components
import MKTypography from "components/MKTypography";

// Images
import logo from "assets/images/small-logos/4RosesHeader.png";

const date = new Date().getFullYear();
// footer.routes.js — export a function instead of an object
export default function getFooterRoutes(t) {
  return {
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
        icon: <BookIcon />,
        link: "/book",
      },
      {
        icon: <img src={Vrbo} alt="Vrbo icon" />,
        link: "https://www.vrbo.com/2905236?dateless=true",
      },
    ],
    menus: [
      {
        name: t("company"),
        items: [
          { name: t("about our property"), href: "/#about" },
          { name: t("about us"), href: "/AboutUs" },
        ],
      },
      {
        name: t("Albums"),
        items: [
          { name: t("interior album"), href: "/albums/interior" },
          { name: t("exterior album"), href: "/albums/exterior" },
          { name: t("video album"), href: "/albums/videos" },
        ],
      },
      {
        name: t("help & support"),
        items: [
          { name: t("Contact us"), href: "/AboutUs/#contactUs", isHashLink: true },
          { name: t("contact developer"), href: "contact-developer" },
        ],
      },
      {
        name: t("legal"),
        items: [
          { name: t("terms & conditions"), href: "terms-and-conditions" },
          { name: t("Website Design licenses"), href: "https://www.creative-tim.com/license" },
        ],
      },
    ],
    copyright: (
      <MKTypography variant="button" fontWeight="regular">
        {t("All rights reserved")}. {t("Copyright")} &copy; {date} Four Roses {t("by")}{" "}
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
        {t("and")}
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
          {t("Built by")}{" "}
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
}
