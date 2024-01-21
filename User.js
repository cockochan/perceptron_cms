import express from "express";
import { config } from "./config.js";
import Database from "./database.js";

const router = express.Router();
router.use(express.json());

// Create database object
const database = new Database(config);

router.get("/users", async (_, res) => {
  try {
    // Return a list of users
    const users = await database.getAllUsers();
    console.log(`Users: ${JSON.stringify(users)}`);
    res.status(200).json(users);
  } catch (err) {
    console.error("Error getting users:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    // Create a user
    const user = req.body;

    // Input validation
    if (!user || !user.username || !user.name) {
      res.status(400).json({ error: "Invalid user data" });
      return;
    }

    console.log(`User: ${JSON.stringify(user)}`);
    const rowsAffected = await database.createUser(user);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Get the user with the specified ID
    const userId = req.params.id;

    // Input validation
    if (!userId) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    console.log(`UserId: ${userId}`);
    const result = await database.getUserById(userId);

    if (!result) {
      res.status(404).json({ error: "User not found" });
    } else {
      console.log(`User: ${JSON.stringify(result)}`);
      res.status(200).json(result);
    }
  } catch (err) {
    console.error("Error getting user:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    // Update the user with the specified ID
    const userId = req.params.id;
    const user = req.body;

    // Input validation
    if (!userId || !user || !user.username || !user.name) {
      res.status(400).json({ error: "Invalid user data" });
      return;
    }

    delete user.id;
    console.log(`User: ${JSON.stringify(user)}`);
    const rowsAffected = await database.updateUser(userId, user);

    if (rowsAffected === 0) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json({ rowsAffected });
    }
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    // Delete the user with the specified ID
    const userId = req.params.id;

    // Input validation
    if (!userId) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    console.log(`UserId: ${userId}`);
    const rowsAffected = await database.deleteUser(userId);

    if (rowsAffected === 0) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(204).json({ rowsAffected });
    }
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
