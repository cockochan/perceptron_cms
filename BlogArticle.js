import express from "express";
import { config } from "./config.js";
import Database from "./database.js";

const router = express.Router();
router.use(express.json());

// Development only - don't do in production
console.log(config);

// Create database object
const database = new Database(config);

router.get("/BlogArticles", async (_, res) => {
  try {
    // Return a list of BlogArticles
    const BlogArticles = await database.readTen();
    console.log(`BlogArticles: ${JSON.stringify(BlogArticles)}`);
    res.status(200).json(BlogArticles);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.post("/", async (req, res) => {
  try {
    // Create a BlogArticle
    const BlogArticle = req.body;
    console.log(`BlogArticle: ${JSON.stringify(BlogArticle)}`);
    const rowsAffected = await database.create(BlogArticle);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Get the BlogArticle with the specified ID
    const BlogArticleId = req.params.id;
    console.log(`BlogArticleId: ${BlogArticleId}`);
    if (BlogArticleId) {
      const result = await database.read(BlogArticleId);
      console.log(`BlogArticles: ${JSON.stringify(result)}`);
      res.status(200).json(result);
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    // Update the BlogArticle with the specified ID
    const BlogArticleId = req.params.id;
    console.log(`BlogArticleId: ${BlogArticleId}`);
    const BlogArticle = req.body;

    if (BlogArticleId && BlogArticle) {
      delete BlogArticle.id;
      console.log(`BlogArticle: ${JSON.stringify(BlogArticle)}`);
      const rowsAffected = await database.update(BlogArticleId, BlogArticle);
      res.status(200).json({ rowsAffected });
    } else {
      res.status(404);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    // Delete the BlogArticle with the specified ID
    const BlogArticleId = req.params.id;
    console.log(`BlogArticleId: ${BlogArticleId}`);

    if (!BlogArticleId) {
      res.status(404);
    } else {
      const rowsAffected = await database.delete(BlogArticleId);
      res.status(204).json({ rowsAffected });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;
