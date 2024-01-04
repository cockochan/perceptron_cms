import express from "express";
import { config } from "./config.js";
import Database from "./database.js";
import cors  from "cors";
// Import App routes
import BlogArticle from "./BlogArticle.js";
import openapi from "./openapi.js";

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
// Development only - don't do in production
// Run this to create the table in the database
if (process.env.NODE_ENV === "development") {
  const database = new Database(config);
  database
    .executeQuery(
      `CREATE TABLE BlogArticle (id int NOT NULL IDENTITY, firstName varchar(255), lastName varchar(255));`
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
app.use("*", (_, res) => {
  res.redirect("/api-docs");
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
