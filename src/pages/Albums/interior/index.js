import { useState } from "react";

// Material Kit 2 React components
import { ColumnsPhotoAlbum } from "react-photo-album";
import "react-photo-album/columns.css";

// @mui material components
import Card from "@mui/material/Card";

// Material Kit 2 React components
import MKBox from "components/MKBox";

// Material Kit 2 React examples
import DefaultNavbar from "examples/Navbars/DefaultNavbar";

// Author page sections
import Footer from "pages/LandingPages/AboutUs/sections/Footer";

// Lightbox includes
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "./index.css";

// Routes
import routes from "routes";

// Images
import bgImage from "assets/images/beach/beach1.jpg";
import Babyfoot from "assets/images/property/interior/babyFoot.jpg";
import Bathroom05 from "assets/images/property/interior/bathroom05.jpg";
import Bathroom06 from "assets/images/property/interior/bathroom06.jpg";
import Bathroom07 from "assets/images/property/interior/bathroom07.jpg";
import Bathroom08 from "assets/images/property/interior/bathroom08.jpg";
import Bedroom01 from "assets/images/property/interior/bedroom01.jpg";
import Bedroom01a from "assets/images/property/interior/bedroom01A.jpg";
import Bedroom01b from "assets/images/property/interior/bedroom01B.jpg";
import Bedroom02 from "assets/images/property/interior/bedroom02.jpg";
import Bedroom02a from "assets/images/property/interior/bedroom02A.jpg";
import Bedroom02b from "assets/images/property/interior/bedroom02B.jpg";
import Bedroom03 from "assets/images/property/interior/bedroom03.jpg";
import Bedroom04 from "assets/images/property/interior/bedroom04.jpg";
import Bedroom05 from "assets/images/property/interior/bedroom05.jpg";
import Bedroom06 from "assets/images/property/interior/bedroom06.jpg";
import Bedroom07 from "assets/images/property/interior/bedroom07.jpg";
import Bedroom08 from "assets/images/property/interior/bedroom08.jpg";
import Bedroom1 from "assets/images/property/interior/bedroom1.jpg";
import Bedroombypool from "assets/images/property/interior/bedroomByPool.jpg";
import Bedroompoolside from "assets/images/property/interior/bedroomPoolSide.jpg";
import Common from "assets/images/property/interior/common.jpg";
import Corridor from "assets/images/property/interior/Corridor.jpg";
import Dinningroomupstairs from "assets/images/property/interior/dinningRoomUpstairs.jpg";
import Kitchen from "assets/images/property/interior/kitchen.jpg";
import Kitchen01 from "assets/images/property/interior/kitchen01.jpg";
import Kitchen02 from "assets/images/property/interior/kitchen02.jpg";
import Kitchen04 from "assets/images/property/interior/kitchen04.jpg";
import Kitchen06 from "assets/images/property/interior/kitchen06.jpg";
import Kitchenupstairs from "assets/images/property/interior/kitchenUpstairs.jpg";
import Landryroom from "assets/images/property/interior/landryRoom.jpg";
import Livingroom01 from "assets/images/property/interior/livingroom01.jpg";
import Livingroomdownstais from "assets/images/property/interior/livingroomDownstais.jpg";
import Livingroomupstairs from "assets/images/property/interior/livingRoomUpstairs.jpg";
import Mainbedroompoolview from "assets/images/property/interior/mainBedroomPoolView.jpg";
import Pooltable from "assets/images/property/interior/poolTable.jpg";
import Washroom from "assets/images/property/interior/Washroom.jpg";
import Washroom01 from "assets/images/property/interior/washroom01.jpg";
import Washroom02 from "assets/images/property/interior/washroom02.jpg";
import Washroom02a from "assets/images/property/interior/washroom02A.jpg";
import Washroom02rev from "assets/images/property/interior/Washroom02rev.jpg";
import Washroom04 from "assets/images/property/interior/washroom04.jpg";
import Washroom4a from "assets/images/property/interior/washroom4A.jpg";
import Washroomview02 from "assets/images/property/interior/washroomView02.jpg";
import Washroomview03 from "assets/images/property/interior/washroomView03.jpg";
import Washroomviewmain from "assets/images/property/interior/washroomViewMain.jpg";
import Workstation from "assets/images/property/interior/workStation.jpg";

const photos = [
  { src: Babyfoot, width: 756, height: 1008 },
  { src: Bathroom05, width: 1008, height: 756 },
  { src: Bathroom06, width: 1008, height: 756 },
  { src: Bathroom07, width: 1008, height: 756 },
  { src: Bathroom08, width: 1008, height: 756 },
  { src: Bedroom01, width: 756, height: 1008 },
  { src: Bedroom01a, width: 1008, height: 756 },
  { src: Bedroom01b, width: 1008, height: 756 },
  { src: Bedroom02, width: 1008, height: 756 },
  { src: Bedroom02a, width: 1008, height: 756 },
  { src: Bedroom02b, width: 756, height: 1008 },
  { src: Bedroom03, width: 1008, height: 756 },
  { src: Bedroom04, width: 1008, height: 756 },
  { src: Bedroom05, width: 1008, height: 756 },
  { src: Bedroom06, width: 1008, height: 756 },
  { src: Bedroom07, width: 1008, height: 756 },
  { src: Bedroom08, width: 1008, height: 756 },
  { src: Bedroom1, width: 1008, height: 756 },
  { src: Bedroombypool, width: 756, height: 1008 },
  { src: Bedroompoolside, width: 756, height: 1008 },
  { src: Common, width: 756, height: 1008 },
  { src: Corridor, width: 1008, height: 756 },
  { src: Dinningroomupstairs, width: 1008, height: 756 },
  { src: Kitchen, width: 756, height: 1008 },
  { src: Kitchen01, width: 1008, height: 756 },
  { src: Kitchen02, width: 756, height: 1008 },
  { src: Kitchen04, width: 756, height: 1008 },
  { src: Kitchen06, width: 756, height: 1008 },
  { src: Kitchenupstairs, width: 1008, height: 756 },
  { src: Landryroom, width: 756, height: 1008 },
  { src: Livingroom01, width: 1008, height: 756 },
  { src: Livingroomdownstais, width: 1008, height: 756 },
  { src: Livingroomupstairs, width: 1008, height: 756 },
  { src: Mainbedroompoolview, width: 756, height: 1008 },
  { src: Pooltable, width: 1008, height: 756 },
  { src: Washroom, width: 1008, height: 756 },
  { src: Washroom01, width: 1008, height: 756 },
  { src: Washroom02, width: 756, height: 1008 },
  { src: Washroom02a, width: 756, height: 1008 },
  { src: Washroom02rev, width: 1008, height: 756 },
  { src: Washroom04, width: 756, height: 1008 },
  { src: Washroom4a, width: 1008, height: 756 },
  { src: Washroomview02, width: 756, height: 1008 },
  { src: Washroomview03, width: 756, height: 1008 },
  { src: Washroomviewmain, width: 756, height: 1008 },
  { src: Workstation, width: 756, height: 1008 },
];

function InteriorPhotos() {
  const [index, setIndex] = useState(-1);
  return (
    <>
      <DefaultNavbar
        routes={routes}
        action={{
          type: "external",
          route: "https://www.creative-tim.com/product/material-kit-react",
          label: "free download",
          color: "info",
        }}
        transparent
        light
      />
      <MKBox bgColor="white">
        <MKBox
          minHeight="35rem"
          width="100%"
          sx={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "grid",
            placeItems: "center",
          }}
        />
        <Card
          sx={{
            p: 2,
            mx: { xs: 2, lg: 3 },
            mt: -8,
            mb: 4,
            backgroundColor: ({ palette: { white }, functions: { rgba } }) => rgba(white.main, 0.8),
            backdropFilter: "saturate(200%) blur(30px)",
            boxShadow: ({ boxShadows: { xxl } }) => xxl,
          }}
        >
          <ColumnsPhotoAlbum
            photos={photos}
            targetRowHeight={200}
            onClick={({ index }) => setIndex(index)}
          />
          <Lightbox
            slides={photos}
            open={index >= 0}
            index={index}
            close={() => setIndex(-1)}
            // enable optional lightbox plugins
            plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
          />
        </Card>
        <Footer />
      </MKBox>
    </>
  );
}

export default InteriorPhotos;
