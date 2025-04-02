// Sections components
import ActivityLayout from "layouts/sections/components/BaseLayout/ActivityLayout";
// import WaterPark from "assets/images/DesignBlocks/waterPark.jpg";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ACTIVITY_ID = 1;

function WaterParks() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, activities(image)")
        .eq("activity_id", ACTIVITY_ID);
      if (error) console.error("Error fetching data:", error);
      else setData(data);
    };

    fetchData();
  }, []);

  const structuredData = data.map((item) => ({
    name: item.name,
    url: item.url,
    photo: item.activities.image,
    article: item.article,
  }));

  return (
    <ActivityLayout
      title="Water Parks"
      breadcrumb={[
        { label: "Home page", route: "/pages/landing-pages/home#Water parks" },
        { label: "Water parks" },
      ]}
      items={structuredData}
    ></ActivityLayout>
  );
}

export default WaterParks;
