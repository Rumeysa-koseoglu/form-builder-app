import express from "express";
import { query } from "../db.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Route
router.get("/public/:formId", async (req, res) => {
  const { formId } = req.params;
  try {
    const form = await query("SELECT * FROM forms WHERE id = $1", [formId]);
    const questions = await query(
      'SELECT * FROM questions WHERE form_id = $1 ORDER BY "order" ASC',
      [formId]
    );

    if (form.rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }

    return res.json({ form: form.rows[0], questions: questions.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load public form" });
  }
}),
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

router.get("/:formId/responses", authenticateToken, async (req: any, res) => {
  const { formId } = req.params;
  const userId = req.user.id;

  try {
    //security control
    const formCheck = await query(
      "SELECT creator_id FROM forms WHERE id = $1",
      [formId]
    );

    if (formCheck.rows.length === 0) {
      return res.status(404).json({ error: "Form not found" });
    }

    if (formCheck.rows[0].creator_id !== userId) {
      return res
        .status(403)
        .json({ error: " Unauthorized to view these responses" });
    }

    //get responses: pull data from responses table
    const responses = await query(
      "SELECT id, submitted_at, total_score FROM responses WHERE form_id = $1 ORDER BY submitted_at DESC",
      [formId]
    );
    res.json(responses.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch responses" });
  }
});

router.get("/", authenticateToken, async (req: any, res) => {
  const userId = req.user.id;
  try {
    const result = await query(
      `SELECT 
    f.id, 
    f.title, 
    f.description, 
    f.is_quiz, 
    f.is_published, 
    f.created_at, 
    COUNT(r.id) as response_count 
FROM forms f 
LEFT JOIN responses r ON f.id = r.form_id 
WHERE f.creator_id = $1 
GROUP BY f.id 
ORDER BY f.created_at DESC;`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Forms could not be retrieved." });
  }
});

// Delete questions
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
  },

  //Delete form
  router.delete("/:id", authenticateToken, async (req: any, res) => {
    try {
      await query("DELETE FROM forms WHERE id = $1 AND creator_id = $2", [
        req.params.id,
        req.user.id,
      ]);
      res.json({ message: "Form deleted" });
    } catch (err) {
      res.status(500).json({ error: "Deletion failed." });
    }
  }),

  // Bulk Publish - Creates form and all questions in one transaction
  router.post("/publish", authenticateToken, async (req: any, res) => {
    const { title, description, isQuiz, questions } = req.body;
    const creator_id = req.user.id;

    try {
      // 1. Start Transaction
      await query("BEGIN");

      // 2. Insert Form with Quiz Support
      const formResult = await query(
        `INSERT INTO forms (title, description, creator_id, is_quiz, is_published) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [title, description, creator_id, isQuiz || false, true]
      );

      const formId = formResult.rows[0].id;

      // 3. Insert All Questions
      for (const q of questions) {
        await query(
          `INSERT INTO questions 
         (form_id, text, type, is_required, options, points, correct_answer, "order") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            formId,
            q.questionText,
            q.type.toLowerCase(),
            q.isRequired,
            q.options ? JSON.stringify(q.options) : null,
            q.points || 0,
            q.correctAnswer ? JSON.stringify(q.correctAnswer) : null,
            q.order || 0,
          ]
        );
      }

      // 4. Commit Transaction
      await query("COMMIT");

      res.status(201).json({
        message: "Form published successfully",
        id: formId,
      });
    } catch (err: any) {
      // Rollback if anything fails
      await query("ROLLBACK");
      console.error("Publish Error:", err);
      res.status(500).json({
        error: "Could not publish form and questions.",
        details: err.message,
      });
    }
  }),

  // Submit Response
  router.post("/:formId/submit", async (req, res) => {
    const { formId } = req.params;
    const { answers } = req.body;

    try {
      await query("BEGIN");

      const formResult = await query(
        "SELECT is_quiz FROM forms WHERE id = $1",
        [formId]
      );
      if (formResult.rows.length === 0) throw new Error("Form not found");
      const isQuiz = formResult.rows[0].is_quiz;

      const responseResult = await query(
        "INSERT INTO responses (form_id, submitted_at, total_score) VALUES ($1, NOW(), $2) RETURNING id",
        [formId, 0]
      );
      const responseId = responseResult.rows[0].id;

      let calculatedScore = 0;

      for (const ans of answers) {
        const qId = parseInt(ans.questionId);

        await query(
          "INSERT INTO answers (response_id, question_id, value) VALUES ($1, $2, $3)",
          [responseId, qId, JSON.stringify(ans.value)]
        );

        if (isQuiz) {
          const qResult = await query(
            "SELECT correct_answer, points FROM questions WHERE id = $1",
            [qId]
          );
          const question = qResult.rows[0];

          if (
            question?.correct_answer &&
            ans.value?.toString().toLowerCase() ===
              question.correct_answer.toLowerCase()
          ) {
            calculatedScore += question.points || 0;
          }
        }
      }

      if (isQuiz) {
        await query("UPDATE responses SET total_score = $1 WHERE id = $2", [
          calculatedScore,
          responseId,
        ]);
      }

      await query("COMMIT");
      res
        .status(201)
        .json({ message: "Success", score: isQuiz ? calculatedScore : null });
    } catch (err: any) {
      await query("ROLLBACK");
      res.status(500).json({ error: "Submit failed", details: err.message });
    }
  }),

  // Get form and question to edit
  router.get("/edit/:id", authenticateToken, async (req: any, res) => {
    try {
      const form = await query(
        "SELECT * FROM forms WHERE id = $1 AND creator_id = $2",
        [req.params.id, req.user.id]
      );

      if (form.rows.length === 0)
        return res.status(404).json({ error: "Form not found" });

      const questions = await query(
        'SELECT * FROM questions WHERE form_id = $1 ORDER BY "order" ASC',
        [req.params.id]
      );

      res.json({ form: form.rows[0], questions: questions.rows });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }),

  // Form update route
  router.put("/:id", authenticateToken, async (req: any, res) => {
    const { title, description, isQuiz, questions } = req.body;
    try {
      await query("BEGIN");

      // 1. Update form title
      await query(
        "UPDATE forms SET title = $1, description = $2, is_quiz = $3 WHERE id = $4 AND creator_id = $5",
        [title, description, isQuiz, req.params.id, req.user.id]
      );

      // 2. Delete old questions
      await query("DELETE FROM questions WHERE form_id = $1", [req.params.id]);

      // 3. Add new/updated questions
      for (const q of questions) {
        await query(
          `INSERT INTO questions (form_id, text, type, is_required, options, points, "order") 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.params.id,
            q.questionText,
            q.type.toLowerCase(),
            q.isRequired,
            JSON.stringify(q.options),
            q.points,
            q.order,
          ]
        );
      }

      await query("COMMIT");
      res.json({ message: "Form updated successfully" });
    } catch (err) {
      await query("ROLLBACK");
      res.status(500).json({ error: "Update failed" });
    }
  })
);

export default router;
