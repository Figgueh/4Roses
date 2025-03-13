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
import bgImage from "assets/images/beach/beach1.jpg";

// Images
import Babyfoot from "assets/images/property/interior/babyFoot.jpg";
import BabyfootThumb from "assets/images/property/interior/256/babyFoot.jpg";
import Bathroom05 from "assets/images/property/interior/bathroom05.jpg";
import Bathroom05Thumb from "assets/images/property/interior/256/bathroom05.jpg";
import Bathroom06 from "assets/images/property/interior/bathroom06.jpg";
import Bathroom06Thumb from "assets/images/property/interior/256/bathroom06.jpg";
import Bathroom07 from "assets/images/property/interior/bathroom07.jpg";
import Bathroom07Thumb from "assets/images/property/interior/256/bathroom07.jpg";
import Bathroom08 from "assets/images/property/interior/bathroom08.jpg";
import Bathroom08Thumb from "assets/images/property/interior/256/bathroom08.jpg";
import Bedroom01 from "assets/images/property/interior/bedroom01.jpg";
import Bedroom01Thumb from "assets/images/property/interior/256/bedroom01.jpg";
import Bedroom01a from "assets/images/property/interior/bedroom01A.jpg";
import Bedroom01aThumb from "assets/images/property/interior/256/bedroom01A.jpg";
import Bedroom01b from "assets/images/property/interior/bedroom01B.jpg";
import Bedroom01bThumb from "assets/images/property/interior/256/bedroom01B.jpg";
import Bedroom02 from "assets/images/property/interior/bedroom02.jpg";
import Bedroom02Thumb from "assets/images/property/interior/256/bedroom02.jpg";
import Bedroom02a from "assets/images/property/interior/bedroom02A.jpg";
import Bedroom02aThumb from "assets/images/property/interior/256/bedroom02A.jpg";
import Bedroom03 from "assets/images/property/interior/bedroom03.jpg";
import Bedroom03Thumb from "assets/images/property/interior/256/bedroom03.jpg";
import Bedroom04 from "assets/images/property/interior/bedroom04.jpg";
import Bedroom04Thumb from "assets/images/property/interior/256/bedroom04.jpg";
import Bedroom05 from "assets/images/property/interior/bedroom05.jpg";
import Bedroom05Thumb from "assets/images/property/interior/256/bedroom05.jpg";
import Bedroom06 from "assets/images/property/interior/bedroom06.jpg";
import Bedroom06Thumb from "assets/images/property/interior/256/bedroom06.jpg";
import Bedroom07 from "assets/images/property/interior/bedroom07.jpg";
import Bedroom07Thumb from "assets/images/property/interior/256/bedroom07.jpg";
import Bedroom08 from "assets/images/property/interior/bedroom08.jpg";
import Bedroom08Thumb from "assets/images/property/interior/256/bedroom08.jpg";
import Bedroom1 from "assets/images/property/interior/bedroom1.jpg";
import Bedroom1Thumb from "assets/images/property/interior/256/bedroom1.jpg";
import Bedroombypool from "assets/images/property/interior/bedroomByPool.jpg";
import BedroombypoolThumb from "assets/images/property/interior/256/bedroomByPool.jpg";
import Bedroompoolside from "assets/images/property/interior/bedroomPoolSide.jpg";
import BedroompoolsideThumb from "assets/images/property/interior/256/bedroomPoolSide.jpg";
import Common from "assets/images/property/interior/common.jpg";
import CommonThumb from "assets/images/property/interior/256/common.jpg";
import Corridor from "assets/images/property/interior/Corridor.jpg";
import CorridorThumb from "assets/images/property/interior/256/Corridor.jpg";
import Dinningroomupstairs from "assets/images/property/interior/dinningRoomUpstairs.jpg";
import DinningroomupstairsThumb from "assets/images/property/interior/256/dinningRoomUpstairs.jpg";
import Kitchen from "assets/images/property/interior/kitchen.jpg";
import KitchenThumb from "assets/images/property/interior/256/kitchen.jpg";
import Kitchen01 from "assets/images/property/interior/kitchen01.jpg";
import Kitchen01Thumb from "assets/images/property/interior/256/kitchen01.jpg";
import Kitchen02 from "assets/images/property/interior/kitchen02.jpg";
import Kitchen02Thumb from "assets/images/property/interior/256/kitchen02.jpg";
import Kitchen04 from "assets/images/property/interior/kitchen04.jpg";
import Kitchen04Thumb from "assets/images/property/interior/256/kitchen04.jpg";
import Kitchen06 from "assets/images/property/interior/kitchen06.jpg";
import Kitchen06Thumb from "assets/images/property/interior/256/kitchen06.jpg";
import Kitchenupstairs from "assets/images/property/interior/kitchenUpstairs.jpg";
import KitchenupstairsThumb from "assets/images/property/interior/256/kitchenUpstairs.jpg";
import Landryroom from "assets/images/property/interior/landryRoom.jpg";
import LandryroomThumb from "assets/images/property/interior/256/landryRoom.jpg";
import Livingroom01 from "assets/images/property/interior/livingroom01.jpg";
import Livingroom01Thumb from "assets/images/property/interior/256/livingroom01.jpg";
import Livingroomdownstais from "assets/images/property/interior/livingroomDownstais.jpg";
import LivingroomdownstaisThumb from "assets/images/property/interior/256/livingroomDownstais.jpg";
import Livingroomupstairs from "assets/images/property/interior/livingRoomUpstairs.jpg";
import LivingroomupstairsThumb from "assets/images/property/interior/256/livingRoomUpstairs.jpg";
import Mainbedroompoolview from "assets/images/property/interior/mainBedroomPoolView.jpg";
import MainbedroompoolviewThumb from "assets/images/property/interior/256/mainBedroomPoolView.jpg";
import Pooltable from "assets/images/property/interior/poolTable.jpg";
import PooltableThumb from "assets/images/property/interior/256/poolTable.jpg";
import Washroom from "assets/images/property/interior/Washroom.jpg";
import WashroomThumb from "assets/images/property/interior/256/Washroom.jpg";
import Washroom01 from "assets/images/property/interior/washroom01.jpg";
import Washroom01Thumb from "assets/images/property/interior/256/washroom01.jpg";
import Washroom02 from "assets/images/property/interior/washroom02.jpg";
import Washroom02Thumb from "assets/images/property/interior/256/washroom02.jpg";
import Washroom02a from "assets/images/property/interior/washroom02A.jpg";
import Washroom02aThumb from "assets/images/property/interior/256/washroom02A.jpg";
import Washroom02rev from "assets/images/property/interior/Washroom02rev.jpg";
import Washroom02revThumb from "assets/images/property/interior/256/Washroom02rev.jpg";
import Washroom04 from "assets/images/property/interior/washroom04.jpg";
import Washroom04Thumb from "assets/images/property/interior/256/washroom04.jpg";
import Washroom4a from "assets/images/property/interior/washroom4A.jpg";
import Washroom4aThumb from "assets/images/property/interior/256/washroom4A.jpg";
import Washroomview02 from "assets/images/property/interior/washroomView02.jpg";
import Washroomview02Thumb from "assets/images/property/interior/256/washroomView02.jpg";
import Washroomview03 from "assets/images/property/interior/washroomView03.jpg";
import Washroomview03Thumb from "assets/images/property/interior/256/washroomView03.jpg";
import Washroomviewmain from "assets/images/property/interior/washroomViewMain.jpg";
import WashroomviewmainThumb from "assets/images/property/interior/256/washroomViewMain.jpg";
import Workstation from "assets/images/property/interior/workStation.jpg";
import WorkstationThumb from "assets/images/property/interior/256/workStation.jpg";
const photos = [
  {
    src: Babyfoot,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Babyfoot, width: 3024, height: 4032 },
      { src: BabyfootThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bathroom05,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bathroom05, width: 4032, height: 3024 },
      { src: Bathroom05Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bathroom06,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bathroom06, width: 4032, height: 3024 },
      { src: Bathroom06Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bathroom07,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bathroom07, width: 4032, height: 3024 },
      { src: Bathroom07Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bathroom08,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bathroom08, width: 4032, height: 3024 },
      { src: Bathroom08Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom01,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Bedroom01, width: 3024, height: 4032 },
      { src: Bedroom01Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom01a,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom01a, width: 4032, height: 3024 },
      { src: Bedroom01aThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom01b,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom01b, width: 4032, height: 3024 },
      { src: Bedroom01bThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom02,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom02, width: 4032, height: 3024 },
      { src: Bedroom02Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom02a,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom02a, width: 4032, height: 3024 },
      { src: Bedroom02aThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom03,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom03, width: 4032, height: 3024 },
      { src: Bedroom03Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom04,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom04, width: 4032, height: 3024 },
      { src: Bedroom04Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom05,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom05, width: 4032, height: 3024 },
      { src: Bedroom05Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom06,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom06, width: 4032, height: 3024 },
      { src: Bedroom06Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom07,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom07, width: 4032, height: 3024 },
      { src: Bedroom07Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom08,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom08, width: 4032, height: 3024 },
      { src: Bedroom08Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroom1,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Bedroom1, width: 4032, height: 3024 },
      { src: Bedroom1Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroombypool,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Bedroombypool, width: 3024, height: 4032 },
      { src: BedroombypoolThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Bedroompoolside,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Bedroompoolside, width: 3024, height: 4032 },
      { src: BedroompoolsideThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Common,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Common, width: 3024, height: 4032 },
      { src: CommonThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Corridor,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Corridor, width: 4032, height: 3024 },
      { src: CorridorThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Dinningroomupstairs,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Dinningroomupstairs, width: 4032, height: 3024 },
      { src: DinningroomupstairsThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Kitchen,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Kitchen, width: 3024, height: 4032 },
      { src: KitchenThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Kitchen01,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Kitchen01, width: 4032, height: 3024 },
      { src: Kitchen01Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Kitchen02,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Kitchen02, width: 3024, height: 4032 },
      { src: Kitchen02Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Kitchen04,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Kitchen04, width: 3024, height: 4032 },
      { src: Kitchen04Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Kitchen06,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Kitchen06, width: 3024, height: 4032 },
      { src: Kitchen06Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Kitchenupstairs,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Kitchenupstairs, width: 4032, height: 3024 },
      { src: KitchenupstairsThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Landryroom,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Landryroom, width: 3024, height: 4032 },
      { src: LandryroomThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Livingroom01,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Livingroom01, width: 4032, height: 3024 },
      { src: Livingroom01Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Livingroomdownstais,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Livingroomdownstais, width: 4032, height: 3024 },
      { src: LivingroomdownstaisThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Livingroomupstairs,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Livingroomupstairs, width: 4032, height: 3024 },
      { src: LivingroomupstairsThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Mainbedroompoolview,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Mainbedroompoolview, width: 3024, height: 4032 },
      { src: MainbedroompoolviewThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Pooltable,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Pooltable, width: 4032, height: 3024 },
      { src: PooltableThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroom,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Washroom, width: 4032, height: 3024 },
      { src: WashroomThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroom01,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Washroom01, width: 4032, height: 3024 },
      { src: Washroom01Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroom02,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Washroom02, width: 3024, height: 4032 },
      { src: Washroom02Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroom02a,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Washroom02a, width: 3024, height: 4032 },
      { src: Washroom02aThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroom02rev,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Washroom02rev, width: 4032, height: 3024 },
      { src: Washroom02revThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroom04,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Washroom04, width: 3024, height: 4032 },
      { src: Washroom04Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroom4a,
    width: 1008,
    height: 756,
    srcSet: [
      { src: Washroom4a, width: 4032, height: 3024 },
      { src: Washroom4aThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroomview02,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Washroomview02, width: 3024, height: 4032 },
      { src: Washroomview02Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroomview03,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Washroomview03, width: 3024, height: 4032 },
      { src: Washroomview03Thumb, width: 256, height: 256 },
    ],
  },
  {
    src: Washroomviewmain,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Washroomviewmain, width: 3024, height: 4032 },
      { src: WashroomviewmainThumb, width: 256, height: 256 },
    ],
  },
  {
    src: Workstation,
    width: 756,
    height: 1008,
    srcSet: [
      { src: Workstation, width: 3024, height: 4032 },
      { src: WorkstationThumb, width: 256, height: 256 },
    ],
  },
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
            // targetRowHeight={100}
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
