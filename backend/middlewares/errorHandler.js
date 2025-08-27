export const errorHandler = (err, req, res) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
};
