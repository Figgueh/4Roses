export const errorHandler = (err, req, res) => {
  console.error(err.stack);

  if (!res || typeof res.status !== "function") {
    console.error("Invalid res object:", res);
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
