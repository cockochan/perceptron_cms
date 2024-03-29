import express from "express";
import { config } from "./config.js";
import Database from "./database.js";
import cors from "cors";
// Import App routes
import BlogArticle from "./BlogArticle.js";
import openapi from "./openapi.js";
import UserRouter from "./User.js";
const port = process.env.FROTEND_PORT || 3000;

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://perceptron.dev",
    "https://percms.ukwest.cloudapp.azure.com/",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use("/users", UserRouter);
// Create an instance of the database
const database = new Database(config);

// Development only - don't do in production
// Run this to create the table in the database
if (process.env.NODE_ENV === "development") {
  database
    .executeQuery(
      `CREATE TABLE BlogArticle (id int NOT NULL IDENTITY, title varchar(255), subtitle varchar(255), author varchar(255), date_published date, category varchar(255), content text, image_url varchar(255));`
    )
    .then(() => {
      console.log("Table created");
    })
    .catch((err) => {
      // Table may already exist
      console.error(`Error creating table: ${err}`);
    });
}

// Connect App routes
app.use("/api-docs", openapi);
app.use("/BlogArticles", BlogArticle);

// User route
app.post("/Users", async (req, res) => {
  try {
    const userData = req.body; // Assuming user data is sent in the request body

    // Assuming you have a 'User' model or a 'users' table in your database
    const userId = await database.createUser(userData);

    res.status(201).json({ userId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/Users/:id", (req, res) => {
  console.log("Handling /Users/:id route");
  // Handle user by ID
});

app.use("*", (_, res) => {
  res.redirect("/api-docs");
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
app.post("/Comments", async (req, res) => {
  try {
    const { userId, content } = req.body;

    // Create a new comment
    const commentId = await database.createComment(userId, content);

    res.status(201).json({ commentId });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/Comments/:id", async (req, res) => {
  try {
    const commentId = req.params.id;

    // Retrieve a comment by ID
    const comment = await database.getCommentById(commentId);

    if (comment) {
      res.status(200).json(comment);
    } else {
      res.status(404).json({ error: "Comment not found" });
    }
  } catch (error) {
    console.error("Error retrieving comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
