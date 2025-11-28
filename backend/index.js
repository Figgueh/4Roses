import express from "express";
import cors from "cors";

// Routes
import homeRoutes from "./routes/home.js";
import articlesRoutes from "./routes/articles.js";
import activityRoutes from "./routes/activities.js";
import amenitiesRoutes from "./routes/amenities.js";
import imageRoutes from "./routes/images.js";
import videoRoutes from "./routes/videos.js";
import emailRoutes from "./routes/email.js";
import reservations from "./routes/reservation.js";
import bodyParser from "body-parser";

// Addons
import { errorHandler } from "./middlewares/errorHandler.js";
import { stripeWebhookHandler } from "./middlewares/stripeWebhook.js";

const app = express();

// Middleware
app.post("/webhook/stripe", bodyParser.raw({ type: "application/json" }), stripeWebhookHandler);

app.use(cors());
app.use(express.json());

// Routes
app.use("/", homeRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/amenities", amenitiesRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/reservation", reservations);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
