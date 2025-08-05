// import ActivityLayout from "components/BaseLayout/ActivityLayout";
import MenuItem from "@mui/material/MenuItem";
import ActivityLayout from "components/BaseLayout/ActivityLayout";
import MKButton from "components/MKButton";
import MKInput from "components/MKInput";
import MKTypography from "components/MKTypography";
import { fetchActivities } from "connection/activities/fetchActivities";
import { generateArticleFromUrl } from "connection/openRouter/generateArticleFromUrl";
import { useEffect, useState } from "react";
import { unslugify } from "utils";

function ActivityGenerator() {
  const [urls, setUrls] = useState([
    "https://villaalvor.pt/en/about-us/",
    "https://villaalvor.pt/en/villa-alvor/",
    "https://villaalvor.pt/en/experiences-and-events/",
  ]);

  const [article, setArticle] = useState("");
  const [parsedArticle, setParsedArticle] = useState(null);
  const [loading, setLoading] = useState(null);
  const [section, setSection] = useState("");
  const [activities, setActivities] = useState([]);

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

  const handleGenerate = () => {
    generateArticleFromUrl(urls, setArticle, setLoading);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchActivities();
      setActivities(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (article && loading === "Done") {
      const cleaned = article.replace(/```json|```/g, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        parsed.id = 100;
        parsed.url = urls[0];
        delete parsed.description;
        setParsedArticle(parsed);
        console.log(parsed);
      } catch (error) {
        console.error("Invalid JSON", error);
      }
    }
  }, [article, loading]);

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Activity Article Generator</h3>

      <MKTypography>for activity:</MKTypography>
      <MKInput select value={section} onChange={(e) => setSection(e.target.value)}>
        {activities.map((activity) => (
          <MenuItem key={activity.id} value={activity.title}>
            {activity.title}
          </MenuItem>
        ))}
      </MKInput>

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
          ({console.log(unslugify(section), parsedArticle)})
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

export default ActivityGenerator;
