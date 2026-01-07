import express from "express";
import { query } from "../db.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

//Creating Form
router.post("/", authenticateToken, async (req: any, res) => {
  const { title, description } = req.body;
  const creator_id = req.user.id;

  try {
    const result = await query(
      "INSERT INTO forms (title, description, creator_id) VALUES ($1, $2, $3) RETURNING *",
      [title, description, creator_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "The form could not be created" });
  }
});

//Adding question
router.post("/:formId/questions", authenticateToken, async (req: any, res) => {
  const { formId } = req.params;
  const { text, type, is_required } = req.body;
  const userId = req.user.id;

  const allowedTypes = [
    "short_text",
    "long_text",
    "multiple_choice",
    "checkbox",
    "dropdown",
  ];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid question type" });
  }

  try {
    // Verify that the from belongs to the user
    const formCheck = await query(
      "SELECT creator_id FROM forms WHERE id = $1",
      [formId]
    );

    if (formCheck.rows.length === 0)
      return res.status(404).json({ error: "Form not found" });
    if (formCheck.rows[0].creator_id !== userId)
      return res.status(403).json({ error: "Unauthorized to edit this form" });

    // Insert the question
    const result = await query(
      "INSERT INTO questions (form_id, text, type, is_required) VALUES ($1, $2, $3, $4) RETURNING *",
      [formId, text, type, is_required]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Question could not be added" });
  }
});

router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const result = await query(
      "SELECT * FROM forms WHERE creator_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Forms could not be retrieved." });
  }
});

router.delete(
  "/questions/:questionId",
  authenticateToken,
  async (req: any, res) => {
    const { questionId } = req.params;
    try {
      await query("DELETE FROM questions WHERE id = $1", [questionId]);
      res.json({ message: "Question delted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Question could not be deleted" });
    }
  }
);

export default router;
