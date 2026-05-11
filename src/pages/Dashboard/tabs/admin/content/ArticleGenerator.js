import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { Menu } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import ActivityLayout from "components/BaseLayout/ActivityLayout";
import { unslugify } from "utils";

const C = {
  cream: "#f5f0eb",
  white: "#ffffff",
  parchment: "#fdf8f3",
  border: "#ede5db",
  gold: "#c9a96e",
  goldLight: "#e8c98a",
  terracotta: "#8b4513",
  terracottaHover: "#a0521a",
  roseBlush: "#c9846e",
  ink: "#1e1612",
  inkMid: "#2c2420",
  inkLight: "#6b5a52",
  muted: "#9e8a80",
  mutedLight: "#b0978a",
};

const s = {
  page: {
    fontFamily: "'Jost', sans-serif",
    backgroundColor: C.cream,
    minHeight: "100vh",
    padding: "48px 16px",
    color: C.inkMid,
  },
  card: {
    maxWidth: 10000,
    margin: "0 auto",
    background: C.white,
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 4px 32px rgba(100,60,40,0.10), 0 1px 4px rgba(100,60,40,0.07)",
  },

  /* header */
  header: {
    background: C.white,
    padding: "36px 52px 28px",
    borderBottom: `1px solid ${C.border}`,
    textAlign: "center",
    position: "relative",
  },
  headerRule: {
    position: "absolute",
    bottom: 0,
    left: 52,
    right: 52,
    height: 1,
    background: `linear-gradient(90deg, transparent, ${C.gold} 30%, ${C.goldLight} 50%, ${C.gold} 70%, transparent)`,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: C.gold,
    marginBottom: 14,
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 38,
    fontWeight: 600,
    lineHeight: 1.12,
    color: C.ink,
    margin: 0,
  },
  titleEm: {
    fontStyle: "italic",
    fontWeight: 400,
    color: C.terracotta,
  },

  /* body */
  body: {
    padding: "40px 52px 36px",
  },

  /* field label */
  label: {
    display: "block",
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: C.mutedLight,
    marginBottom: 10,
    marginTop: 28,
  },

  /* select button */
  selectBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: C.parchment,
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    padding: "11px 18px",
    fontSize: 13,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 400,
    color: C.inkMid,
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
    minWidth: 220,
    justifyContent: "space-between",
  },
  selectBtnChevron: {
    fontSize: 18,
    color: C.gold,
    transition: "transform 0.2s",
    lineHeight: 1,
  },

  /* url row */
  urlRow: {
    display: "flex",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  urlInput: {
    flex: 1,
    fontFamily: "'Jost', sans-serif",
    fontSize: 13,
    fontWeight: 300,
    color: C.inkMid,
    background: C.parchment,
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    padding: "10px 14px",
    outline: "none",
    transition: "border-color 0.15s",
  },
  removeBtn: {
    background: "none",
    border: `1px solid #e0c8be`,
    borderRadius: 3,
    color: C.roseBlush,
    fontSize: 11,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "9px 14px",
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
    whiteSpace: "nowrap",
  },

  /* ghost add-url link */
  addLink: {
    background: "none",
    border: "none",
    fontFamily: "'Jost', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: C.gold,
    cursor: "pointer",
    padding: "6px 0",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  /* divider */
  divider: {
    border: "none",
    height: 1,
    background: `linear-gradient(90deg, transparent, ${C.border} 20%, ${C.border} 80%, transparent)`,
    margin: "32px 0",
  },

  /* status strip */
  statusStripBase: {
    borderRadius: 4,
    padding: "14px 18px",
    marginBottom: 24,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },

  /* loading dots */
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: C.muted,
    fontSize: 12,
    fontWeight: 300,
    letterSpacing: "0.1em",
  },

  /* primary CTA */
  ctaWrap: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  primaryBtn: {
    background: C.terracotta,
    color: "#fff",
    border: "none",
    borderRadius: 2,
    fontFamily: "'Jost', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    padding: "15px 40px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  stopBtn: {
    background: "none",
    border: `1px solid #e0c8be`,
    borderRadius: 2,
    fontFamily: "'Jost', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: C.roseBlush,
    padding: "14px 28px",
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  },
  dismissBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: C.mutedLight,
    fontSize: 16,
    lineHeight: 1,
    padding: 2,
    alignSelf: "flex-start",
  },

  /* footer */
  footer: {
    background: C.parchment,
    borderTop: `1px solid ${C.border}`,
    padding: "20px 52px",
    textAlign: "center",
  },
  footerText: {
    fontSize: 10.5,
    color: "#b8a89e",
    lineHeight: 1.6,
    margin: 0,
    fontFamily: "'Jost', sans-serif",
  },

  menuItemName: {
    fontFamily: "'Jost', sans-serif",
    fontSize: 13,
    fontWeight: 400,
    color: C.inkMid,
  },
  menuItemId: {
    fontFamily: "'Jost', sans-serif",
    fontSize: 10,
    color: C.muted,
    marginTop: 2,
    letterSpacing: "0.04em",
  },
};

const menuPaperProps = {
  style: {
    background: C.parchment,
    border: `1px solid ${C.border}`,
    boxShadow: "0 4px 20px rgba(100,60,40,0.12)",
    borderRadius: 4,
    minWidth: 220,
  },
};

const menuItemSx = {
  fontFamily: "'Jost', sans-serif",
  fontSize: 13,
  color: C.inkMid,
  "&:hover": { background: "#f0e8de" },
  "&.Mui-selected": { background: "#e8ddd2" },
};

/* ─────────────────────────── component ─────────────────────────── */
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

  const [freeModels, setFreeModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState(null);
  const [modelDropdown, setModelDropdown] = useState(null);
  const [dropdown, setDropdown] = useState(null);

  const eventSourceRef = useRef(null);

  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const res = await axios.get("https://openrouter.ai/api/v1/models");
        const models = res.data?.data ?? [];
        const free = models
          .filter((m) => m.id.endsWith(":free"))
          .sort((a, b) => a.name.localeCompare(b.name));
        setFreeModels(free);
        const defaultModel =
          free.find((m) => m.id === "tngtech/deepseek-r1t2-chimera:free") ?? free[0] ?? null;
        setSelectedModel(defaultModel);
      } catch {
        setModelsError("Could not load models from OpenRouter.");
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND}/activities`);
      setActivities(res.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activities.length && !section) setSection(activities[0]);
  }, [activities]);

  const handleUrlChange = (index, val) => {
    const next = [...urls];
    next[index] = val;
    setUrls(next);
  };
  const handleAddUrl = () => setUrls([...urls, ""]);
  const handleRemoveUrl = (index) => setUrls(urls.filter((_, i) => i !== index));

  const handleGenerate = () => {
    setError(null);
    setArticle("");
    setStatus("Sending details to server");
    if (eventSourceRef.current) eventSourceRef.current.close();

    const modelParam = selectedModel ? `&model=${encodeURIComponent(selectedModel.id)}` : "";
    const sse = new EventSource(
      `${process.env.REACT_APP_BACKEND}/articles/generateArticleFromUrls?urls=${encodeURIComponent(
        JSON.stringify(urls)
      )}${modelParam}`
    );
    eventSourceRef.current = sse;

    sse.addEventListener("preProcessing", (e) => setStatus(e.data));
    sse.addEventListener("metadata", (e) => {
      const parsed = JSON.parse(e.data);
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
    sse.addEventListener("section", (e) => {
      const parsed = JSON.parse(e.data);
      setArticle((prev) => ({ ...prev, content: [...(prev.content ?? []), parsed] }));
    });
    sse.addEventListener("done", () => {
      setStatus("Done");
      sse.close();
      eventSourceRef.current = null;
    });
    sse.addEventListener("error", (e) => {
      const parsed = JSON.parse(e.data);
      setError(parsed.message + " " + (parsed.error ?? ""));
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

  const isGenerating = status && status !== "Done" && status !== "idle" && status !== "Stopped";

  const Dots = () => (
    <span style={{ display: "inline-flex", gap: 4, marginLeft: 8 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: C.gold,
            display: "inline-block",
            animation: `fourRosesPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        @keyframes fourRosesPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        .fr-select-btn:hover { border-color: ${C.gold} !important; }
        .fr-url-input:focus { border-color: ${C.gold} !important; box-shadow: 0 0 0 3px rgba(201,169,110,0.12); }
        .fr-remove-btn:hover { color: ${C.terracotta} !important; border-color: ${C.roseBlush} !important; }
        .fr-add-link:hover { color: ${C.terracottaHover} !important; }
        .fr-primary-btn:hover { background: ${C.terracottaHover} !important; }
        .fr-stop-btn:hover { color: ${C.terracotta} !important; border-color: ${C.terracotta} !important; }
      `}</style>

      <div style={s.page}>
        <div style={s.card}>
          {/* ── Header ── */}
          <div style={s.header}>
            <div style={s.eyebrow}>Four Roses · Content Studio</div>
            <h1 style={s.title}>
              Article <em style={s.titleEm}>Generator</em>
            </h1>
            <div style={s.headerRule} />
          </div>

          {/* ── Body ── */}
          <div style={s.body}>
            {/* Activity */}
            <span style={{ ...s.label, marginTop: 0 }}>Activity Section</span>
            <button
              className="fr-select-btn"
              style={s.selectBtn}
              onClick={(e) => setDropdown(e.currentTarget)}
            >
              <span>{section?.title || "—"}</span>
              <span
                style={{
                  ...s.selectBtnChevron,
                  transform: dropdown ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                ›
              </span>
            </button>
            <Menu
              anchorEl={dropdown}
              open={Boolean(dropdown)}
              onClose={() => setDropdown(null)}
              PaperProps={menuPaperProps}
            >
              {activities.map((a) => (
                <MenuItem
                  key={a.id}
                  onClick={() => {
                    setSection(a);
                    setDropdown(null);
                  }}
                  sx={menuItemSx}
                >
                  {a.title}
                </MenuItem>
              ))}
            </Menu>

            {/* Model */}
            <span style={s.label}>AI Model</span>
            {modelsLoading ? (
              <div style={s.loadingWrap}>
                <Dots />
                <span style={{ marginLeft: 4 }}>Loading free models…</span>
              </div>
            ) : modelsError ? (
              <div
                style={{ ...s.statusStripBase, background: "#fdf3ef", border: `1px solid #e8c0b0` }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 8.5,
                      fontWeight: 500,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: C.roseBlush,
                      marginBottom: 4,
                    }}
                  >
                    Warning
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 16,
                      color: C.terracotta,
                    }}
                  >
                    {modelsError}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  className="fr-select-btn"
                  style={{ ...s.selectBtn, minWidth: 300 }}
                  onClick={(e) => setModelDropdown(e.currentTarget)}
                >
                  <span>{selectedModel ? selectedModel.name : "Select a model"}</span>
                  <span
                    style={{
                      ...s.selectBtnChevron,
                      transform: modelDropdown ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  >
                    ›
                  </span>
                </button>
                <Menu
                  anchorEl={modelDropdown}
                  open={Boolean(modelDropdown)}
                  onClose={() => setModelDropdown(null)}
                  PaperProps={{
                    ...menuPaperProps,
                    style: { ...menuPaperProps.style, minWidth: 300, maxHeight: 320 },
                  }}
                >
                  {freeModels.map((m) => (
                    <MenuItem
                      key={m.id}
                      selected={selectedModel?.id === m.id}
                      onClick={() => {
                        setSelectedModel(m);
                        setModelDropdown(null);
                      }}
                      sx={{
                        display: "block",
                        "&:hover": { background: "#f0e8de" },
                        "&.Mui-selected": { background: "#e8ddd2" },
                      }}
                    >
                      <div style={s.menuItemName}>{m.name}</div>
                      <div style={s.menuItemId}>{m.id}</div>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            <hr style={s.divider} />

            {/* URLs */}
            <span style={{ ...s.label, marginTop: 0 }}>Context URLs</span>
            {urls.map((url, index) => (
              <div key={index} style={s.urlRow}>
                <input
                  className="fr-url-input"
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  style={s.urlInput}
                  placeholder="https://…"
                />
                <button
                  className="fr-remove-btn"
                  style={s.removeBtn}
                  onClick={() => handleRemoveUrl(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button className="fr-add-link" style={s.addLink} onClick={handleAddUrl}>
              <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span> Add URL
            </button>

            <hr style={s.divider} />

            {/* Error */}
            {error && (
              <div
                style={{
                  ...s.statusStripBase,
                  background: "#fdf3ef",
                  border: `1px solid #e8c0b0`,
                  marginBottom: 20,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 8.5,
                      fontWeight: 500,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: C.roseBlush,
                      marginBottom: 4,
                    }}
                  >
                    Error
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 16,
                      color: C.terracotta,
                    }}
                  >
                    {error}
                  </div>
                </div>
                <button style={s.dismissBtn} onClick={() => setError(null)}>
                  ✕
                </button>
              </div>
            )}

            {/* Status */}
            {status && status !== "idle" && !error && (
              <div
                style={{
                  ...s.statusStripBase,
                  background: C.parchment,
                  border: `1px solid ${C.border}`,
                  marginBottom: 20,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 8.5,
                      fontWeight: 500,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: C.mutedLight,
                      marginBottom: 4,
                    }}
                  >
                    Generator Status
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 16,
                        color: C.inkMid,
                      }}
                    >
                      {status}
                    </span>
                    {isGenerating && <Dots />}
                  </div>
                </div>
                <button style={s.dismissBtn} onClick={() => setStatus(null)}>
                  ✕
                </button>
              </div>
            )}

            {/* Actions */}
            <div style={s.ctaWrap}>
              <button className="fr-primary-btn" style={s.primaryBtn} onClick={handleGenerate}>
                {status === "Done" ? "Regenerate Article" : "Generate Article"}
              </button>
              {isGenerating && (
                <button
                  className="fr-stop-btn"
                  style={s.stopBtn}
                  onClick={() => {
                    if (eventSourceRef.current) {
                      eventSourceRef.current.close();
                      setStatus("Stopped");
                      eventSourceRef.current = null;
                    }
                  }}
                >
                  Stop
                </button>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={s.footer}>
            <p style={s.footerText}>
              Free models via OpenRouter &middot; Content is AI-generated and should be reviewed
              before publishing
            </p>
          </div>
        </div>

        {/* Article preview */}
        {article?.title && (
          <div style={{ margin: "40px auto 0" }}>
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
          </div>
        )}
      </div>
    </>
  );
}

export default ArticleGenerator;
