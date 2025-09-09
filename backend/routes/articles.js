import express from "express";
import {
  getArticles,
  getArticleByTitle,
  getArticlesForActivity,
  generateArticleFromUrls,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getArticles);
router.get("/:title", getArticleByTitle);
router.get("/activity/:activityId", getArticlesForActivity);
router.post("/generateArticleFromUrls", generateArticleFromUrls);
router.post("/", upload.single("image"), createArticle);
router.put("/:id", upload.single("image"), updateArticle);
router.delete("/:id", deleteArticle);

export default router;
