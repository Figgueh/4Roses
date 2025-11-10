import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActivityLayout from "components/BaseLayout/ActivityLayout";

import ActivityPicker from "components/BaseLayout/ActivityPicker";
import { unslugify } from "utils";
import { useTranslation } from "react-i18next";

import axios from "axios";
const API_BASE = process.env.REACT_APP_BACKEND;

function ActivityBuilder() {
  const { section, slug } = useParams();
  const [listOfArticles, setListOfArticles] = useState([]);
  const [article, setArticle] = useState(null);
  const [activity_id, setActivity_id] = useState();
  const [transActivity, setTransActivity] = useState("");
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Functions that fetch data:
    const fetchData = async () => {
      const activityRes = await axios.get(`${API_BASE}/activities/${unslugify(section)}`);
      const activityId = activityRes.data.id;
      setActivity_id(activityId);

      const articlesListData = await axios.get(
        `${API_BASE}/articles/activity/${activityId}?lang=${i18n.language}`
      );
      setListOfArticles(articlesListData.data);

      if (i18n.language != "en") {
        const transRequest = await axios.get(
          `${process.env.REACT_APP_BACKEND}/activities/translation/${activityId}?lang=${i18n.language}`
        );
        setTransActivity(transRequest.data.title);
      } else {
        setTransActivity(section);
      }

      if (slug) {
        const articleData = await axios.get(
          `${process.env.REACT_APP_BACKEND}/articles/${unslugify(slug)}?lang=${i18n.language}`
        );
        setArticle(articleData.data);
      }
    };
    fetchData();
  }, [section, slug, i18n.language]);

  if (!slug) {
    return (
      <ActivityPicker
        title={unslugify(section)}
        breadcrumb={[{ label: t("Home page"), route: "/#" + section }, { label: transActivity }]}
        items={listOfArticles}
        id={activity_id}
      />
    );
  }

  if (slug && article) {
    return (
      <ActivityLayout
        title={unslugify(section)}
        breadcrumb={[
          { label: t("Home page"), route: "/#" + section },
          { label: transActivity, route: "/activities/" + section },
          { label: article.title },
        ]}
        item={article}
        setItem={setArticle}
      />
    );
  }
}

export default ActivityBuilder;
