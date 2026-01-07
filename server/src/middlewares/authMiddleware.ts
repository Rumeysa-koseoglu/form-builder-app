import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_KEY;

// --- MIDDLEWARE: Authentcate Token ---
export const authenticateToken = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_KEY is not defined.");
    return res
      .status(500)
      .json({ error: "Internal server configuration error" });
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Acces denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};
