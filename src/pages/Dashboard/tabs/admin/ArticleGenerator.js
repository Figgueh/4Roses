// import ActivityLayout from "components/BaseLayout/ActivityLayout";
import { Icon, Menu } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import ActivityLayout from "components/BaseLayout/ActivityLayout";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import { generateArticleFromUrl } from "connection/openRouter/generateArticleFromUrl";
import { useEffect, useState } from "react";
import { unslugify } from "utils";
import { v4 as uuidv4 } from "uuid";

import axios from "axios";

function ArticleGenerator() {
  const [urls, setUrls] = useState([
    "https://villaalvor.pt/en/about-us/",
    "https://villaalvor.pt/en/villa-alvor/",
    "https://villaalvor.pt/en/experiences-and-events/",
  ]);

  const [article, setArticle] = useState("");
  const [parsedArticle, setParsedArticle] = useState(null);
  const [loading, setLoading] = useState(null);
  const [section, setSection] = useState("");
  const [error, setError] = useState("");
  const [activities, setActivities] = useState([]);

  const [dropdown, setDropdown] = useState(null);
  const openDropdown = ({ currentTarget }) => setDropdown(currentTarget);
  const closeDropdown = () => setDropdown(null);

  const handleUrlChange = (index, newValue) => {
    const updatedUrls = [...urls];
    updatedUrls[index] = newValue;
    setUrls(updatedUrls);
  };

  const handleAddUrl = () => {
    setUrls([...urls, ""]);
  };

  const handleRemoveUrl = (index) => {
    const updatedUrls = urls.filter((_, i) => i !== index);
    setUrls(updatedUrls);
  };

  const handleGenerate = async () => {
    setError(null);
    try {
      setLoading("Loading...");
      await generateArticleFromUrl(urls, setArticle, setLoading);
    } catch (err) {
      console.error("Article generation failed:", err);
      setError(err.message || "Something went wrong while generating the article.");
      setLoading(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const activitiesRequest = await axios.get(`${process.env.REACT_APP_BACKEND}/activities`);
      setActivities(activitiesRequest.data);
      if (activities.length) {
        setSection(activities[0]?.title);
      }
    };
    fetchData();
  }, []);

  // Once the activities are loaded, select the first one.
  useEffect(() => {
    if (activities.length && !section) {
      setSection(activities[0].title);
    }
  }, [activities]);

  useEffect(() => {
    if (article && loading === "Done") {
      const cleaned = article.replace(/```json|```/g, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        parsed.isPreview = true;
        parsed.id = uuidv4();
        parsed.url = urls.join(", ");
        // delete parsed.description;
        setParsedArticle(parsed);
        console.log(parsed);
      } catch (error) {
        console.error("Invalid JSON", error);
      }
    }
  }, [article, loading]);

  const iconStyles = {
    ml: 1,
    fontWeight: "bold",
    transition: "transform 200ms ease-in-out",
  };
  const dropdownIconStyles = {
    transform: dropdown ? "rotate(180deg)" : "rotate(0)",
    ...iconStyles,
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Activity Article Generator</h3>

      <MKTypography>Select the activity of the article:</MKTypography>
      <MKButton variant="gradient" color="info" onClick={openDropdown}>
        {section} <Icon sx={dropdownIconStyles}>expand_more</Icon>
      </MKButton>

      <Menu anchorEl={dropdown} open={Boolean(dropdown)} onClose={closeDropdown}>
        {activities.map((activity) => (
          <MenuItem
            key={activity.id}
            onClick={() => {
              setSection(activity.title);
              closeDropdown();
            }}
            value={activity.title}
            label="Select Activity"
          >
            {activity.title}
          </MenuItem>
        ))}
      </Menu>

      <MKTypography>Data points for context:</MKTypography>
      {urls.map((url, index) => (
        <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
            style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            placeholder="Enter URL"
          />
          <MKButton color="error" size="small" onClick={() => handleRemoveUrl(index)}>
            Remove
          </MKButton>
        </div>
      ))}

      <div style={{ marginBottom: "1rem" }}>
        <MKButton color="secondary" onClick={handleAddUrl}>
          Add URL
        </MKButton>
      </div>

      <MKButton onClick={handleGenerate} variant="gradient" color="info">
        Generate Article
      </MKButton>

      {loading && <p>{loading}</p>}

      {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}, Please try again.</div>}

      <pre
        style={{
          whiteSpace: "pre-wrap",
          marginTop: "1rem",
          background: "#f8f9fa",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        {article}
      </pre>

      {loading === "Done" && parsedArticle?.article && (
        <>
          {console.log(unslugify(section), parsedArticle)}
          <ActivityLayout
            title={unslugify(section)}
            breadcrumb={[
              { label: "Home page", route: `/#${section}` },
              { label: unslugify(section), route: `/activities/${section}` },
              { label: parsedArticle.title },
            ]}
            item={parsedArticle}
            setItem={(newItem) => setParsedArticle((prev) => ({ ...prev, article: newItem }))}
          />
        </>
      )}
    </div>
  );
}

export default ArticleGenerator;
