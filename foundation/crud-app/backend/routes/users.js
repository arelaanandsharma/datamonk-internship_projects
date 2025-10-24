import express from "express";
import db from "../models/db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const [result] = await db.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );
    res.json({ id: result.insertId, name, email });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("MySQL error (POST /):", err.message);
    res.status(500).json({ error: "Database error" });
  }
});


// READ
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("MySQL error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    await db.query("UPDATE users SET name=?, email=? WHERE id=?", [
      name,
      email,
      req.params.id,
    ]);
    res.json({ id: req.params.id, name, email });
  } catch (err) {
    console.error(" MySQL error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(" MySQL error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;

