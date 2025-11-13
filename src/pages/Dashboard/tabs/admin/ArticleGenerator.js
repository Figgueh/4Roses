import { useEffect, useState } from "react";
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

  const [status, setStatus] = useState(null);
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
    setArticle("");
    setStatus("Sending details to server...");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/articles/generateArticleFromUrls`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls }),
        }
      );

      // Setup a reader to read SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let currentEvent = "message";

      // Loop which reads what is sent from the server
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        for (let line of lines.slice(0, -1)) {
          line = line.trim();
          if (!line) continue;

          // Parse the event data
          if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();

            // Parse the payload stored in "data:"
          } else if (line.startsWith("data:")) {
            const payload = line.slice(5).trim();

            // Server finished sending all the data
            if (payload === "[DONE]") {
              // Append the other necessary data
              setArticle((prev) => ({
                ...prev,
                id: uuidv4(),
                url: urls.join(", "),
                activityId: section.id,
                activityName: section.title,
              }));

              setStatus("Done");
              return;
            }

            // Event specific behavior
            // Error handling
            if (currentEvent === "error") {
              const parsed = JSON.parse(payload);
              console.error("Backend error:", parsed);
              setError(parsed.message + " " + parsed.error);
              setStatus(null);

              // Server status handling
            } else if (currentEvent == "preProcessing") {
              setStatus(payload);

              // Metadata handling
            } else if (currentEvent == "metadata") {
              const parsed = JSON.parse(payload);
              setArticle((prev) => ({
                ...prev,
                title: parsed.title,
                image: parsed.image,
                description: parsed.description,
                content: [],
                isPreview: true,
              }));

              // Article content handling
            } else if (currentEvent == "section") {
              const parsed = JSON.parse(payload);
              setArticle((prev) => ({
                ...prev,
                content: [...(prev.content ?? []), parsed],
              }));
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setStatus(null);
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
            setItem={(newItem) => setArticle((prev) => ({ ...prev, article: newItem }))}
          />
        </>
      )}
    </div>
  );
}

export default ArticleGenerator;
