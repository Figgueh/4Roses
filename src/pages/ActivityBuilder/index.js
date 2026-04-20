import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import ActivityLayout from "components/BaseLayout/ActivityLayout";
import ActivityPicker from "components/BaseLayout/ActivityPicker";
import SEO from "components/SEO";

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
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const activityRes = await axios.get(`${API_BASE}/activities/${unslugify(section)}`);
      const activityId = activityRes.data.id;
      setActivity_id(activityId);

      const articlesListData = await axios.get(
        `${API_BASE}/articles/activity/${activityId}?lang=${i18n.language}`
      );
      setListOfArticles(articlesListData.data);

      if (i18n.language !== "en") {
        const transRequest = await axios.get(
          `${process.env.REACT_APP_BACKEND}/activities/translation/${activityId}?lang=${i18n.language}`
        );
        setTransActivity(transRequest.data.title);
      } else {
        setTransActivity(unslugify(section));
      }

      if (slug) {
        const articleData = await axios.get(
          `${process.env.REACT_APP_BACKEND}/articles/${unslugify(slug)}?lang=${i18n.language}`
        );
        setArticle(articleData.data);
      } else {
        setArticle(null);
      }
    };

    fetchData();
  }, [section, slug, i18n.language]);

  const seoData = useMemo(() => {
    const activityName = transActivity || unslugify(section);

    if (slug && article) {
      const seoImage = article.image?.startsWith("http")
        ? article.image
        : article.image
        ? `${process.env.REACT_APP_BACKEND}${article.image}`
        : undefined;

      return {
        title: `${article.title} | ${activityName} | Four Roses`,
        description:
          article.description ||
          article.summary ||
          t("Discover this article from our activity guide in Alvor, Portugal."),
        image: seoImage,
        type: "article",
        structuredData: {
          "@type": "Article",
          headline: article.title,
          description:
            article.description ||
            article.summary ||
            t("Discover this article from our activity guide in Alvor, Portugal."),
          image: seoImage,
        },
      };
    }

    return {
      title: `${activityName} activities in Alvor, Portugal | Four Roses`,
      description: t(
        t(
          "Discover the best things to do in Alvor, Portugal. Explore top activities, local recommendations, hidden gems, and must visit spots for an unforgettable stay."
        )
      ),
      type: "website",
      structuredData: {
        "@type": "CollectionPage",
        name: `${activityName} activities in Alvor, Portugal | Four Roses`,
        description: t(
          t(
            "Discover the best things to do in Alvor, Portugal. Explore top activities, local recommendations, hidden gems, and must visit spots for an unforgettable stay."
          )
        ),
      },
    };
  }, [section, slug, article, transActivity, t]);

  if (!slug) {
    return (
      <>
        <SEO
          title={seoData.title}
          description={seoData.description}
          image={seoData.image}
          type={seoData.type}
          structuredData={seoData.structuredData}
        />

        <ActivityPicker
          title={unslugify(section)}
          breadcrumb={[{ label: t("Home page"), route: "/#" + section }, { label: transActivity }]}
          items={listOfArticles}
          id={activity_id}
        />
      </>
    );
  }

  if (slug && article) {
    return (
      <>
        <SEO
          title={seoData.title}
          description={seoData.description}
          image={seoData.image}
          type={seoData.type}
          structuredData={seoData.structuredData}
        />

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
      </>
    );
  }

  return null;
}

export default ActivityBuilder;
