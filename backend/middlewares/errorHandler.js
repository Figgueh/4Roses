export const errorHandler = (err, req, res) => {
  if (!res || typeof res.status !== "function") {
    console.error("Invalid res object:", res);
    return;
  }

  if (err) {
    console.error("Supabase error:", err.message);
    return res.status(500).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
