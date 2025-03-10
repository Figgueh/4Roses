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
import Wifi from "assets/images/DesignBlocks/wifi.png";
import Kitchen from "assets/images/property/interior/kitchenUpstairs.jpg";
import TV from "assets/images/property/interior/dinningRoomUpstairs.jpg";
import Bathroom from "assets/images/DesignBlocks/washroomViewMain.jpg";
import Fireplace from "assets/images/property/interior/dinningRoomUpstairs.jpg";
import PoolTable from "assets/images/property/interior/poolTable.jpg";
import BabyFoot from "assets/images/DesignBlocks/babyFoot.jpg";
import Pool from "assets/images/DesignBlocks/poolView.jpg";
import OutDoorOven from "assets/images/DesignBlocks/outDoorOven.jpg";
import Laundry from "assets/images/DesignBlocks/laundryRoom.jpg";
import Parking from "assets/images/DesignBlocks/parking.jpg";
import AC from "assets/images/DesignBlocks/ac.png";

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
        image: `${TV}`,
        name: "Smart televisions with cable service",
        sub: "5 Smart Television",
      },
      {
        image: `${Pool}`,
        name: "Private heated pool",
        sub: "Heated pool included from June to August. Rest of year 30 euros per day. Paid upon arrival.",
      },
      {
        image: `${Bathroom}`,
        name: "Bathroom supplies",
        sub: "Soaps, Shampoo, Toilet paper, Towels, Linens",
      },
      {
        image: `${Kitchen}`,
        name: "Kitchen supplies",
        sub: "Microwave, Dishwasher, Grill, Coffee maker",
      },
      {
        image: `${OutDoorOven}`,
        name: "Outdoor & Indoor grill",
        sub: "Includes a pizza oven",
      },
      {
        image: `${Laundry}`,
        name: "Laundry mateirals",
        sub: "Washer, Dryer, Iron & Board",
      },
      {
        image: `${Parking}`,
        name: "Private parking",
        sub: "Space for 2 cars",
      },
      {
        image: `${Wifi}`,
        name: "Highspeed wifi",
        sub: "500+ Mbps, serivce provided by MIO",
      },
      {
        image: `${AC}`,
        name: "Air conditioning in all bed rooms",
        sub: "6 total",
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
