export const welcome = async (req, res, next) => {
  try {
    const env = process.env.NODE_ENV || "production";

    const frontendUrl =
      env === "development" ? "https://4roses.dev.fignet.ca/" : "https://4roses.fignet.ca/";

    res.send(`<div style="font-family:sans-serif;text-align:center;margin-top:20%;">
        <h2>This is the backend service</h2>
        <p>Please visit our main site:</p>
        <a href="${frontendUrl}" style="color:#007bff;text-decoration:none;">${frontendUrl}</a>
      </div>`);
  } catch (err) {
    next(err);
  }
};
