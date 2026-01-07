import express, { type Request, type Response } from "express";
import { query } from "../db.js";

const router = express.Router();

router.get("/forms/:formId", async (req: Request, res: Response) => {
  const { formId } = req.params;

  try {
    const formResult = await query(
      "SELECT title, description FROM forms WHERE id = $1",
      [formId]
    );
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }

    const questionResult = await query(
      "SELECT id, text, type, is_required FROM questions WHERE form_id = $1",
      [formId]
    );

    const questionsWithOptions = await Promise.all(
      questionResult.rows.map(async (question: any) => {
        const optionsResult = await query(
          "SELECT id, option_text FROM options WHERE question_id = $1",
          [question.id]
        );
        return { ...question, options: optionsResult.rows };
      })
    );

    res.json({
      form: formResult.rows,
      questions: questionsWithOptions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "A server error occurred" });
  }
});

export default router;
