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
    res.status(500).json({ error: err?.message });
  }
});

router.post("/users", async (req, res) => {
  try {
    // Create a user
    const user = req.body;
    console.log(`User: ${JSON.stringify(user)}`);
    const rowsAffected = await database.createUser(user);
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Get the user with the specified ID
    const userId = req.params.id;
    console.log(`UserId: ${userId}`);
    if (userId) {
      const result = await database.getUserById(userId);
      console.log(`User: ${JSON.stringify(result)}`);
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
    // Update the user with the specified ID
    const userId = req.params.id;
    console.log(`UserId: ${userId}`);
    const user = req.body;

    if (userId && user) {
      delete user.id;
      console.log(`User: ${JSON.stringify(user)}`);
      const rowsAffected = await database.updateUser(userId, user);
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
    // Delete the user with the specified ID
    const userId = req.params.id;
    console.log(`UserId: ${userId}`);

    if (!userId) {
      res.status(404);
    } else {
      const rowsAffected = await database.deleteUser(userId);
      res.status(204).json({ rowsAffected });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
});

export default router;
