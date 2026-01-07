import express, { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import "dotenv/config";

const router = express.Router();

const JWT_SECRET = process.env.JWT_KEY;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

//--- ROUTE: Register ---
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: "User already exists or data invalid" });
  }
});

// --- ROUTE: Login ---
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(403).json({ error: "Incorrect password" });

    //Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
