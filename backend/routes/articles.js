import express from "express";
import {
  getArticles,
  getArticleByTitle,
  getArticlesForActivity,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";

const router = express.Router();

router.get("/", getArticles);
router.get("/:title", getArticleByTitle);
router.get("/activity/:activityId", getArticlesForActivity);
router.post("/", createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

export default router;
