import { useState } from "react";
import { VideoLibrary } from "@mui/icons-material";
import { CircularProgress, Paper, TextField } from "@mui/material";
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";
import PhotoViewer from "pages/Albums/PhotoViewer";
import axios from "axios";

function VideoUploader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND}/videos`, {
        url,
      });
      setMessage("Video added successfully!");
      setUrl("");
      triggerRefresh();
    } catch (err) {
      console.error(err);
      setMessage("Failed to add video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MKBox display="flex" justifyContent="center" alignItems="center" mt={4} mb={4} px={2}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            maxWidth: 500,
            width: "100%",
            textAlign: "center",
          }}
        >
          <VideoLibrary sx={{ fontSize: 50, color: "primary.main", mb: 1 }} />
          <MKTypography variant="h5" mb={2} fontWeight="bold">
            Add a New Video
          </MKTypography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Video URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              variant="outlined"
              placeholder="https://www.youtube.com/watch?v=..."
              sx={{ mb: 3 }}
            />

            <MKButton
              type="submit"
              color="info"
              variant="gradient"
              fullWidth
              disabled={loading || !url}
              sx={{ py: 1.2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Video"}
            </MKButton>

            {message && (
              <MKTypography
                variant="body2"
                mt={2}
                sx={{
                  color: message.startsWith("Failed") ? "error.main" : "success.main",
                }}
              >
                {message}
              </MKTypography>
            )}
          </form>
        </Paper>
      </MKBox>
      <PhotoViewer album="video" refreshFlag={refreshFlag} />;
    </>
  );
}

export default VideoUploader;
