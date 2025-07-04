import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActivityLayout from "components/BaseLayout/ActivityLayout";

//database imports
import { fetchArticlesForActivity } from "connection/articles/fetchArticlesForActivity";
import { fetchActivitiesIdByName } from "connection/activities/fetchActivitiesIdByName";
import { fetchArticleByTitle } from "connection/articles/fetchArticleByTitle";

import ActivityPicker from "components/BaseLayout/ActivityPicker";
import { unslugify } from "utils";

function ActivityBuilder() {
  const { section, slug } = useParams();
  const [listOfArticles, setListOfArticles] = useState([]);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    // Functions that fetch data:
    const fetchData = async () => {
      const activityId = await fetchActivitiesIdByName(unslugify(section));
      const articlesListData = await fetchArticlesForActivity(activityId);
      setListOfArticles(articlesListData);

      if (slug) {
        const articleData = await fetchArticleByTitle(unslugify(slug));
        setArticle(articleData);
      }
    };
    fetchData();
  }, [section, slug]);

  if (!slug) {
    return (
      <ActivityPicker
        title={unslugify(section)}
        breadcrumb={[{ label: "Home page", route: "/#" + section }, { label: unslugify(section) }]}
        items={listOfArticles}
      />
    );
  }

  if (slug && article) {
    return (
      <ActivityLayout
        title={unslugify(section)}
        breadcrumb={[
          { label: "Home page", route: "/#" + section },
          { label: unslugify(section), route: "/activities/" + section },
          { label: article.title },
        ]}
        item={article}
        setItem={setArticle}
      />
    );
  }
}

export default ActivityBuilder;
