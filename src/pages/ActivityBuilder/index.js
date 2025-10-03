import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActivityLayout from "components/BaseLayout/ActivityLayout";

//database imports
// import { fetchArticleByTitle } from "connection/articles/fetchArticleByTitle";

import ActivityPicker from "components/BaseLayout/ActivityPicker";
import { unslugify } from "utils";
import { useTranslation } from "react-i18next";

import axios from "axios";
const API_BASE = process.env.REACT_APP_BACKEND;

function ActivityBuilder() {
  const { section, slug } = useParams();
  const [listOfArticles, setListOfArticles] = useState([]);
  const [article, setArticle] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Functions that fetch data:
    const fetchData = async () => {
      const activityRes = await axios.get(`${API_BASE}/activities/${unslugify(section)}`);
      const activityId = activityRes.data.id;

      const articlesListData = await axios.get(`${API_BASE}/articles/activity/${activityId}`);
      setListOfArticles(articlesListData.data);

      if (slug) {
        const articleData = await axios.get(
          `${process.env.REACT_APP_BACKEND}/articles/${unslugify(slug)}?lang=${i18n.language}`
        );
        console.log(articleData);
        setArticle(articleData.data);
      }
    };
    fetchData();
  }, [section, slug]);

  useEffect(() => {
    const fetchTranslatedArticle = async () => {
      if (slug) {
        try {
          const articleData = await axios.get(
            `${process.env.REACT_APP_BACKEND}/articles/${unslugify(slug)}?lang=${i18n.language}`
          );
          setArticle(articleData.data);
        } catch (err) {
          console.error("Failed to fetch translated article", err);
        }
      }
    };

    fetchTranslatedArticle();
  }, [i18n.language, slug]);

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
