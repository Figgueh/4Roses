import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { Icon, Menu, Alert, AlertTitle } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import ActivityLayout from "components/BaseLayout/ActivityLayout";

import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";

import { unslugify } from "utils";

function ArticleGenerator() {
  const [urls, setUrls] = useState([
    "https://villaalvor.pt/en/about-us/",
    "https://villaalvor.pt/en/villa-alvor/",
    "https://villaalvor.pt/en/experiences-and-events/",
  ]);

  const [article, setArticle] = useState("");

  const [status, setStatus] = useState("idle");
  const [section, setSection] = useState("");
  const [error, setError] = useState("");
  const [activities, setActivities] = useState([]);

  const [dropdown, setDropdown] = useState(null);
  const openDropdown = ({ currentTarget }) => setDropdown(currentTarget);
  const closeDropdown = () => setDropdown(null);

  const eventSourceRef = useRef(null);

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
    setArticle("");
    setStatus("Sending details to server...");

    // Close previous SSE connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new SSE connection
    const sse = new EventSource(
      `${process.env.REACT_APP_BACKEND}/articles/generateArticleFromUrls?urls=${encodeURIComponent(
        JSON.stringify(urls)
      )}`
    );

    eventSourceRef.current = sse;

    sse.addEventListener("preProcessing", (event) => setStatus(event.data));
    sse.addEventListener("metadata", (event) => {
      const parsed = JSON.parse(event.data);
      setArticle((prev) => ({
        ...prev,
        id: uuidv4(),
        title: parsed.title,
        image: parsed.image,
        description: parsed.description,
        content: [],
        url: urls.join(", "),
        activityName: section.title,
        activityId: section.id,
        isPreview: true,
      }));
    });
    sse.addEventListener("section", (event) => {
      const parsed = JSON.parse(event.data);
      setArticle((prev) => ({
        ...prev,
        content: [...(prev.content ?? []), parsed],
      }));
    });
    sse.addEventListener("done", () => {
      setStatus("Done");
      sse.close();
      eventSourceRef.current = null;
    });
    sse.addEventListener("error", (event) => {
      const parsed = JSON.parse(event.data);
      setError(parsed.message + " " + parsed.error ?? "");
      setStatus(null);
      sse.close();
      eventSourceRef.current = null;
    });
    sse.addEventListener("abort", () => {
      setStatus("idle");
      sse.close();
      eventSourceRef.current = null;
    });
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
      setSection(activities[0]);
    }
  }, [activities]);

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
        {section?.title}
        <Icon sx={dropdownIconStyles}>expand_more</Icon>
      </MKButton>

      <Menu anchorEl={dropdown} open={Boolean(dropdown)} onClose={closeDropdown}>
        {activities.length > 0 &&
          activities.map((activity) => (
            <MenuItem
              key={activity.id}
              onClick={() => {
                setSection(activity);
                closeDropdown();
              }}
            >
              {activity.title}
            </MenuItem>
          ))}
      </Menu>

      <MKTypography sx={{ mt: 2 }}>Data points for context:</MKTypography>
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
      {error && (
        <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      {status && error == null && (
        <Alert sx={{ mt: 2 }} severity="success" onClose={() => setStatus(null)}>
          <AlertTitle>Article generator status</AlertTitle>
          {status}
        </Alert>
      )}

      <MKButton onClick={handleGenerate} variant="gradient" color="info" sx={{ my: 2 }}>
        {status === "Done" ? "Regenerate" : "Generate"} article
      </MKButton>

      {status !== "Done" && status !== "idle" && status !== "Stopped" && (
        <MKButton
          // variant="outlined"
          color="error"
          sx={{ ml: 2 }}
          onClick={() => {
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              setStatus("Stopped");
              eventSourceRef.current = null;
            }
          }}
        >
          Stop generation
        </MKButton>
      )}

      {article?.title && (
        <>
          {console.log(unslugify(section), article)}
          <ActivityLayout
            title={unslugify(section)}
            breadcrumb={[
              { label: "Home page", route: `/#${section}` },
              { label: unslugify(section), route: `/activities/${section}` },
              { label: article.title },
            ]}
            item={article}
            setItem={(newItem) => setArticle((prev) => ({ ...prev, ...newItem }))}
          />
        </>
      )}
    </div>
  );
}

export default ArticleGenerator;
