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
// Amenities images
import Fireplace from "assets/images/property/interior/dinningRoomUpstairs.jpg";
import PoolTable from "assets/images/property/interior/poolTable.jpg";
import BabyFoot from "assets/images/DesignBlocks/babyFoot.jpg";
import Pool from "assets/images/property/exterior/poolBright.jpg";

// Activities images
import JetSki from "assets/images/DesignBlocks/jetSki.jpg";

const imagesPrefix =
  "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/material-design-system/presentation/sections";

export default [
  {
    title: "Included Amenities",
    description: "All these amenities are included",
    items: [
      {
        image: `${imagesPrefix}/headers.jpg`,
        name: "Free highspeed wifi",
      },
      {
        image: `${imagesPrefix}/headers.jpg`,
        name: "Smart televisions with cable service",
      },
      {
        image: `${Pool}`,
        name: "Private heated pool",
      },
      {
        image: `${Fireplace}`,
        name: "Fireplace",
      },
      {
        image: `${PoolTable}`,
        name: "Pool table",
      },
      {
        image: `${BabyFoot}`,
        name: "Baby foot table",
      },
      {
        image: `${imagesPrefix}/headers.jpg`,
        name: "Air conditioning in all rooms",
      },
      {
        image: `${imagesPrefix}/headers.jpg`,
        name: "Basic bathroom supplies",
      },
      {
        image: `${imagesPrefix}/headers.jpg`,
        name: "Basic kitchen supplies",
      },
      {
        image: `${imagesPrefix}/headers.jpg`,
        name: "Outdoor & Indoor grill",
      },
      {
        image: `${imagesPrefix}/headers.jpg`,
        name: "Washer, Dryer, Iron & Board",
      },
      {
        image: `${imagesPrefix}/headers.jpg`,
        name: "Parking for 2 cars",
      },
    ],
  },
  {
    title: "Nearby activities",
    description: "All of these activities are offered",
    items: [
      {
        image: `${imagesPrefix}/navbars.jpg`,
        name: "Water parks",
        route: "/sections/navigation/navbars",
      },
      {
        image: `${imagesPrefix}/nav-tabs.jpg`,
        name: "Parasailing",
        route: "/sections/navigation/nav-tabs",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Swimming",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Winery tours",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Water sports",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Shopping",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Water skiing",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Snorkelling",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Golf",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${JetSki}`,
        name: "Jet skiing",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Wildlife viewing",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Boating",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Birdwatching",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Paddle boating",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Fishing",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Kayaking",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Marina",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Surfing",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Gambling",
        route: "/sections/navigation/pagination",
      },
      {
        image: `${imagesPrefix}/pagination.jpg`,
        name: "Site seeing",
        route: "/sections/navigation/pagination",
      },
    ],
  },
];
