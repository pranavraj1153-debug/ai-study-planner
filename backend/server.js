require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  generateStudyPlan,
} = require("./services/planner");

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,

  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,

  createStudySession,
  getStudySessions,
} = require("./db/queries");

const app = express();

// ------------------------------------
// Middleware
// ------------------------------------
app.use(cors());
app.use(express.json());

// ==================================================
// HOME ROUTE
// ==================================================

app.get("/", (req, res) => {
  res.json({
    message: "AI Study Planner API is running!",
  });
});

// ==================================================
// TASK ROUTES - POSTGRESQL
// ==================================================

// GET ALL TASKS
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await getTasks();

    res.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);

    res.status(500).json({
      message: "Could not fetch tasks",
    });
  }
});

// GET SINGLE TASK
app.get("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid task id",
    });
  }

  try {
    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error(
      "GET /api/tasks/:id error:",
      error
    );

    res.status(500).json({
      message: "Could not fetch task",
    });
  }
});

// CREATE TASK
app.post("/api/tasks", async (req, res) => {
  const {
    subject,
    time,
    estimatedMinutes = 60,
    completedMinutes = 0,
    difficulty = "medium",
    priority = "medium",
  } = req.body;

  if (
    !subject ||
    typeof subject !== "string" ||
    !subject.trim()
  ) {
    return res.status(400).json({
      message: "Subject is required",
    });
  }

  if (
    !time ||
    typeof time !== "string" ||
    !time.trim()
  ) {
    return res.status(400).json({
      message: "Time is required",
    });
  }

  const minutes = Number(estimatedMinutes);
  const studiedMinutes = Number(completedMinutes);

  if (
    !Number.isInteger(minutes) ||
    minutes <= 0
  ) {
    return res.status(400).json({
      message:
        "estimatedMinutes must be a positive whole number",
    });
  }

  if (
    !Number.isInteger(studiedMinutes) ||
    studiedMinutes < 0
  ) {
    return res.status(400).json({
      message:
        "completedMinutes must be a non-negative whole number",
    });
  }

  if (studiedMinutes > minutes) {
    return res.status(400).json({
      message:
        "completedMinutes cannot exceed estimatedMinutes",
    });
  }

  if (
    !["easy", "medium", "hard"].includes(
      difficulty
    )
  ) {
    return res.status(400).json({
      message:
        "difficulty must be easy, medium, or hard",
    });
  }

  if (
    !["low", "medium", "high"].includes(
      priority
    )
  ) {
    return res.status(400).json({
      message:
        "priority must be low, medium, or high",
    });
  }

  try {
    const newTask = await createTask({
      subject: subject.trim(),
      time: time.trim(),
      estimatedMinutes: minutes,
      completedMinutes: studiedMinutes,
      difficulty,
      priority,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(
      "POST /api/tasks error:",
      error
    );

    res.status(500).json({
      message: "Could not create task",
    });
  }
});

// UPDATE TASK
app.put("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid task id",
    });
  }

  const {
    subject,
    time,
    estimatedMinutes,
    completedMinutes,
    difficulty,
    priority,
    completed,
  } = req.body;

  if (subject !== undefined) {
    if (
      typeof subject !== "string" ||
      !subject.trim()
    ) {
      return res.status(400).json({
        message: "Subject cannot be empty",
      });
    }
  }

  if (time !== undefined) {
    if (
      typeof time !== "string" ||
      !time.trim()
    ) {
      return res.status(400).json({
        message: "Time cannot be empty",
      });
    }
  }

  if (estimatedMinutes !== undefined) {
    const value = Number(
      estimatedMinutes
    );

    if (
      !Number.isInteger(value) ||
      value <= 0
    ) {
      return res.status(400).json({
        message:
          "estimatedMinutes must be a positive whole number",
      });
    }
  }

  if (completedMinutes !== undefined) {
    const value = Number(
      completedMinutes
    );

    if (
      !Number.isInteger(value) ||
      value < 0
    ) {
      return res.status(400).json({
        message:
          "completedMinutes must be a non-negative whole number",
      });
    }
  }

  if (
    difficulty !== undefined &&
    !["easy", "medium", "hard"].includes(
      difficulty
    )
  ) {
    return res.status(400).json({
      message:
        "difficulty must be easy, medium, or hard",
    });
  }

  if (
    priority !== undefined &&
    !["low", "medium", "high"].includes(
      priority
    )
  ) {
    return res.status(400).json({
      message:
        "priority must be low, medium, or high",
    });
  }

  try {
    const existingTask =
      await getTaskById(id);

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const finalEstimatedMinutes =
      estimatedMinutes !== undefined
        ? Number(estimatedMinutes)
        : existingTask.estimatedMinutes;

    const finalCompletedMinutes =
      completedMinutes !== undefined
        ? Number(completedMinutes)
        : existingTask.completedMinutes;

    if (
      finalCompletedMinutes >
      finalEstimatedMinutes
    ) {
      return res.status(400).json({
        message:
          "completedMinutes cannot exceed estimatedMinutes",
      });
    }

    const updatedTask =
      await updateTask(id, {
        subject:
          subject !== undefined
            ? subject.trim()
            : undefined,

        time:
          time !== undefined
            ? time.trim()
            : undefined,

        estimatedMinutes:
          estimatedMinutes !== undefined
            ? finalEstimatedMinutes
            : undefined,

        completedMinutes:
          completedMinutes !== undefined
            ? finalCompletedMinutes
            : undefined,

        difficulty,
        priority,
        completed,
      });

    res.json(updatedTask);
  } catch (error) {
    console.error(
      "PUT /api/tasks/:id error:",
      error
    );

    res.status(500).json({
      message: "Could not update task",
    });
  }
});

// DELETE TASK
app.delete(
  "/api/tasks/:id",
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid task id",
      });
    }

    try {
      const deleted =
        await deleteTask(id);

      if (!deleted) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      res.json({
        message:
          "Task deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE /api/tasks/:id error:",
        error
      );

      res.status(500).json({
        message: "Could not delete task",
      });
    }
  }
);

// ==================================================
// EXAM ROUTES - POSTGRESQL
// ==================================================

// GET ALL EXAMS
app.get("/api/exams", async (req, res) => {
  try {
    const exams = await getExams();

    res.json(exams);
  } catch (error) {
    console.error(
      "GET /api/exams error:",
      error
    );

    res.status(500).json({
      message: "Could not fetch exams",
    });
  }
});

// GET SINGLE EXAM
app.get("/api/exams/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid exam id",
    });
  }

  try {
    const exam = await getExamById(id);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.json(exam);
  } catch (error) {
    console.error(
      "GET /api/exams/:id error:",
      error
    );

    res.status(500).json({
      message: "Could not fetch exam",
    });
  }
});

// CREATE EXAM
app.post("/api/exams", async (req, res) => {
  const {
    subject,
    examDate,
  } = req.body;

  if (
    !subject ||
    typeof subject !== "string" ||
    !subject.trim()
  ) {
    return res.status(400).json({
      message: "Subject is required",
    });
  }

  if (!examDate) {
    return res.status(400).json({
      message: "Exam date is required",
    });
  }

  const date = new Date(examDate);

  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({
      message: "Invalid exam date",
    });
  }

  try {
    const exam = await createExam({
      subject: subject.trim(),
      examDate,
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error(
      "POST /api/exams error:",
      error
    );

    res.status(500).json({
      message: "Could not create exam",
    });
  }
});

// UPDATE EXAM
app.put("/api/exams/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid exam id",
    });
  }

  const {
    subject,
    examDate,
  } = req.body;

  if (subject !== undefined) {
    if (
      typeof subject !== "string" ||
      !subject.trim()
    ) {
      return res.status(400).json({
        message:
          "Subject cannot be empty",
      });
    }
  }

  if (examDate !== undefined) {
    const date = new Date(examDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message:
          "Invalid exam date",
      });
    }
  }

  try {
    const updatedExam =
      await updateExam(id, {
        subject:
          subject !== undefined
            ? subject.trim()
            : undefined,
        examDate,
      });

    if (!updatedExam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.json(updatedExam);
  } catch (error) {
    console.error(
      "PUT /api/exams/:id error:",
      error
    );

    res.status(500).json({
      message: "Could not update exam",
    });
  }
});

// DELETE EXAM
app.delete(
  "/api/exams/:id",
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid exam id",
      });
    }

    try {
      const deleted =
        await deleteExam(id);

      if (!deleted) {
        return res.status(404).json({
          message: "Exam not found",
        });
      }

      res.json({
        message:
          "Exam deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE /api/exams/:id error:",
        error
      );

      res.status(500).json({
        message: "Could not delete exam",
      });
    }
  }
);
// ==================================================
// STUDY SESSION ROUTES
// ==================================================

// ------------------------------------
// GET ALL STUDY SESSIONS
// ------------------------------------

app.get(
  "/api/study-sessions",
  async (req, res) => {
    try {
      const sessions =
        await getStudySessions();

      res.json(sessions);
    } catch (error) {
      console.error(
        "GET /api/study-sessions error:",
        error
      );

      res.status(500).json({
        message:
          "Could not fetch study sessions",
      });
    }
  }
);

// ------------------------------------
// CREATE STUDY SESSION
// ------------------------------------

app.post(
  "/api/study-sessions",
  async (req, res) => {
    const {
      taskId,
      minutes,
      sessionDate,
    } = req.body;

    const numericTaskId =
      Number(taskId);

    const numericMinutes =
      Number(minutes);

    // Validate task ID
    if (
      !Number.isInteger(
        numericTaskId
      ) ||
      numericTaskId <= 0
    ) {
      return res.status(400).json({
        message:
          "taskId must be a positive whole number",
      });
    }

    // Validate minutes
    if (
      !Number.isInteger(
        numericMinutes
      ) ||
      numericMinutes <= 0
    ) {
      return res.status(400).json({
        message:
          "minutes must be a positive whole number",
      });
    }

    // Validate optional date
    if (sessionDate !== undefined) {
      const date = new Date(
        `${sessionDate}T00:00:00`
      );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid session date",
        });
      }
    }

    try {
      const session =
        await createStudySession({
          taskId: numericTaskId,
          minutes: numericMinutes,
          sessionDate:
            sessionDate || null,
        });

      res.status(201).json(session);
    } catch (error) {
      console.error(
        "POST /api/study-sessions error:",
        error
      );

      if (
        error.message ===
        "Task not found"
      ) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      if (
        error.message.includes(
          "cannot exceed remaining task time"
        )
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      res.status(500).json({
        message:
          "Could not create study session",
      });
    }
  }
);
// ==================================================
// STUDY PLAN ROUTE
// ==================================================

app.post("/api/study-plan", async (req, res) => {
  const hours = Number(
    req.body.availableHours
  );

  if (
    !Number.isFinite(hours) ||
    hours <= 0
  ) {
    return res.status(400).json({
      message:
        "availableHours must be a positive number",
    });
  }

  try {
    const tasks = await getTasks();
    const exams = await getExams();

    const studyPlan =
      generateStudyPlan(
        tasks,
        exams,
        hours
      );

    res.json({
      availableHours: hours,
      plan: studyPlan,
    });
  } catch (error) {
    console.error(
      "Study plan generation error:",
      error
    );

    res.status(500).json({
      message:
        "Could not generate study plan",
    });
  }
});

// ==================================================
// START SERVER
// ==================================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});