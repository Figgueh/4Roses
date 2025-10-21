export const errorHandler = (err, req, res) => {
  if (!res || typeof res.status !== "function") {
    console.error("Invalid res object:", res);
    return;
  }

  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
