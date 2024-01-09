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
app.use(cors());
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
app.post("/api/Users", async (req, res) => {
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
