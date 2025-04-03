// Sections components
import ActivityLayout from "layouts/sections/components/BaseLayout/ActivityLayout";
import { useState, useEffect } from "react";

//database imports
import { fetchArticlesForActivity } from "connection/articles/fetchArticlesForActivity";

const ACTIVITY_ID = 1;

function WaterParks() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setArticles(await fetchArticlesForActivity(ACTIVITY_ID));
    };

    fetchData();
  }, []);

  return (
    <ActivityLayout
      title="Water Parks"
      breadcrumb={[
        { label: "Home page", route: "/pages/landing-pages/home#Water parks" },
        { label: "Water parks" },
      ]}
      items={articles}
    ></ActivityLayout>
  );
}

export default WaterParks;
