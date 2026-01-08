import express, { type Request, type Response } from "express";
import { query } from "../db.js";

const router = express.Router();
//--
router.get("/forms/:formId", async (req: Request, res: Response) => {
  const { formId } = req.params;

  try {
    // get form
    const formResult = await query(
      "SELECT title, description FROM forms WHERE id = $1",
      [formId]
    );
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }

    // get questions
    const questionResult = await query(
      "SELECT id, text, type, is_required FROM questions WHERE form_id = $1",
      [formId]
    );

    // get options for every question
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

//--
router.post("/forms/:formId/submit", async (req: Request, res: Response) => {
  const { formId } = req.params;
  const { answers } = req.body;

  try {
    // get questions of form and its necessity situations
    const questions = await query(
      "SELECT id, is_required, correct_answer, marks FROM questions WHERE form_id = $1",
      [formId]
    );

    // variable to keep total score
    let totalScore = 0;

    // validation
    for (const q of questions.rows) {
      const answer = answers.find((a: any) => a.question_id === q.id);
      if (q.is_required && (!answer || !answer.value)) {
        return res
          .status(400)
          .json({ error: `Question ID ${q.id} is required.` });
      }
      if (answer && q.correct_answer && q.correct_answer === answer.value) {
        totalScore += q.marks || 0;
      }
    }

    // save the answer to the main table
    const responseResult = await query(
      "INSERT INTO responses (form_id, total_score) VALUES ($1, $2) RETURNING id",
      [formId, totalScore]
    );

    const responseId = responseResult.rows[0].id;

    // save all answers
    for (const ans of answers) {
      await query(
        "INSERT INTO answers (response_id, question_id, answer_text) VALUES ($1, $2, $3)",
        [responseId, ans.question_id, ans.value]
      );
    }

    //return confirmation message and optional score
    res
      .status(201)
      .json({ message: "Form submitted successfully", score: totalScore });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while saving the answer." });
  }
});

export default router;
