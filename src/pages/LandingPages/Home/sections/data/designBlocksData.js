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
// Modified images
import Pool from "assets/images/DesignBlocks/poolView.jpg";
import OutDoorOven from "assets/images/DesignBlocks/outDoorOven.jpg";
import Bathroom from "assets/images/DesignBlocks/washroomViewMain.jpg";
import Laundry from "assets/images/DesignBlocks/laundryRoom.jpg";
import Fireplace from "assets/images/DesignBlocks/fireplace.png";
import BabyFoot from "assets/images/DesignBlocks/babyFoot.jpg";
// Unedited
import Kitchen from "assets/images/property/interior/kitchen1A.jpg";
import PoolTable from "assets/images/property/interior/garagePoolTable.jpg";
// import WaterPark from "public/assets/images/waterPark.jpg";
// import SkyDiving from "public/assets/images/skyDive.jpg";

// Activities images
import JetSki from "assets/images/DesignBlocks/jetSki.jpg";

//Small icons
import WifiImage from "@mui/icons-material/WifiRounded";
import AC from "@mui/icons-material/AcUnitTwoTone";
import TV from "@mui/icons-material/ConnectedTv";
import Parking from "@mui/icons-material/LocalParking";

//Imports for database
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const imagesPrefix = process.env.PUBLIC_URL + "/assets/images";
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const getActivities = async () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("activities").select("*");
      if (error) console.error("Error fetching data:", error);
      else setData(data);
    };

    fetchData();
  }, []);

  const structuredData = data.map((item) => ({
    image: item.photo,
    name: item.name,
    route: item.route,
  }));
  return structuredData;
};

export default [
  {
    title: "Included Amenities",
    description: "All these amenities are included",
    items: [
      [getActivities],
      {
        image: `${Pool}`,
        name: "Private heated pool",
        sub: "Heated pool included from June to August. Rest of year 30 euros per day. Paid upon arrival.",
      },
      {
        image: `${OutDoorOven}`,
        name: "Outdoor & Indoor grill",
        sub: "Includes a pizza oven",
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
        image: `${Laundry}`,
        name: "Laundry mateirals",
        sub: "Washer, Dryer, Iron & Board",
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
    smallItems: [
      {
        image: <WifiImage />,
        name: "wifi",
        sub: "500+ Mbps, serivce provided by MIO",
      },
      {
        image: <AC />,
        name: "Air conditioning in all bed rooms",
        sub: "6 total",
      },
      {
        image: <TV />,
        name: "Smart televisions with cable service",
        sub: "5 Smart Television",
      },
      {
        image: <Parking />,
        name: "Private parking",
        sub: "Space for 2 cars",
      },
    ],
  },
  {
    title: "Nearby activities",
    description: "All of these activities are offered",
    items: [
      {
        image: `${imagesPrefix}/waterPark.jpg`,
        name: "Water parks",
        route: "/pages/activites/waterParks",
      },
      {
        image: `${imagesPrefix}/skyDive.jpg`,
        name: "Sky Diving",
        route: "/pages/activites/SkyDiving",
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
    smallItems: [],
  },
];
