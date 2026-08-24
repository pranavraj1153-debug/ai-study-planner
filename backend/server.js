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
} = require("./db/queries");

const app = express();

// ------------------------------------
// Middleware
// ------------------------------------
app.use(cors());
app.use(express.json());

// ==================================================
// EXAM DATA
// NOTE: Exams are still in-memory for now.
// We will migrate them to PostgreSQL next.
// ==================================================

let exams = [
  {
    id: 1,
    subject: "Data Structures",
    examDate: "2026-09-03",
  },
  {
    id: 2,
    subject: "Database Systems",
    examDate: "2026-09-09",
  },
];

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

// ------------------------------------
// GET ALL TASKS
// ------------------------------------

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

// ------------------------------------
// GET SINGLE TASK
// ------------------------------------

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

// ------------------------------------
// CREATE NEW TASK
// ------------------------------------

app.post("/api/tasks", async (req, res) => {
  const {
    subject,
    time,
    estimatedMinutes = 60,
    completedMinutes = 0,
    difficulty = "medium",
    priority = "medium",
  } = req.body;

  // Subject validation
  if (
    !subject ||
    typeof subject !== "string" ||
    !subject.trim()
  ) {
    return res.status(400).json({
      message: "Subject is required",
    });
  }

  // Time validation
  if (
    !time ||
    typeof time !== "string" ||
    !time.trim()
  ) {
    return res.status(400).json({
      message: "Time is required",
    });
  }

  // Estimated minutes
  const minutes = Number(estimatedMinutes);

  if (
    !Number.isInteger(minutes) ||
    minutes <= 0
  ) {
    return res.status(400).json({
      message:
        "estimatedMinutes must be a positive whole number",
    });
  }

  // Completed minutes
  const studiedMinutes =
    Number(completedMinutes);

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

  // Difficulty
  const validDifficulties = [
    "easy",
    "medium",
    "hard",
  ];

  if (
    !validDifficulties.includes(difficulty)
  ) {
    return res.status(400).json({
      message:
        "difficulty must be easy, medium, or hard",
    });
  }

  // Priority
  const validPriorities = [
    "low",
    "medium",
    "high",
  ];

  if (
    !validPriorities.includes(priority)
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

// ------------------------------------
// UPDATE TASK
// ------------------------------------

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

  // Validate subject if provided
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

  // Validate time if provided
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

  // Validate estimated minutes if provided
  if (estimatedMinutes !== undefined) {
    const minutes = Number(
      estimatedMinutes
    );

    if (
      !Number.isInteger(minutes) ||
      minutes <= 0
    ) {
      return res.status(400).json({
        message:
          "estimatedMinutes must be a positive whole number",
      });
    }
  }

  // Validate completed minutes if provided
  if (completedMinutes !== undefined) {
    const studiedMinutes = Number(
      completedMinutes
    );

    if (
      !Number.isInteger(studiedMinutes) ||
      studiedMinutes < 0
    ) {
      return res.status(400).json({
        message:
          "completedMinutes must be a non-negative whole number",
      });
    }
  }

  // Validate difficulty
  if (difficulty !== undefined) {
    const validDifficulties = [
      "easy",
      "medium",
      "hard",
    ];

    if (
      !validDifficulties.includes(difficulty)
    ) {
      return res.status(400).json({
        message:
          "difficulty must be easy, medium, or hard",
      });
    }
  }

  // Validate priority
  if (priority !== undefined) {
    const validPriorities = [
      "low",
      "medium",
      "high",
    ];

    if (
      !validPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message:
          "priority must be low, medium, or high",
      });
    }
  }

  try {
    // Get existing task first so we can
    // validate cross-field constraints.
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

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

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

// ------------------------------------
// DELETE TASK
// ------------------------------------

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
// EXAM ROUTES - STILL IN MEMORY
// ==================================================

// ------------------------------------
// GET ALL EXAMS
// ------------------------------------

app.get("/api/exams", (req, res) => {
  res.json(exams);
});

// ------------------------------------
// GET SINGLE EXAM
// ------------------------------------

app.get("/api/exams/:id", (req, res) => {
  const id = Number(req.params.id);

  const exam = exams.find(
    (exam) => exam.id === id
  );

  if (!exam) {
    return res.status(404).json({
      message: "Exam not found",
    });
  }

  res.json(exam);
});

// ------------------------------------
// CREATE NEW EXAM
// ------------------------------------

app.post("/api/exams", (req, res) => {
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

  const newExam = {
    id:
      exams.length > 0
        ? Math.max(
            ...exams.map(
              (exam) => exam.id
            )
          ) + 1
        : 1,

    subject: subject.trim(),
    examDate,
  };

  exams.push(newExam);

  res.status(201).json(newExam);
});

// ------------------------------------
// UPDATE EXAM
// ------------------------------------

app.put("/api/exams/:id", (req, res) => {
  const id = Number(req.params.id);

  const exam = exams.find(
    (exam) => exam.id === id
  );

  if (!exam) {
    return res.status(404).json({
      message: "Exam not found",
    });
  }

  if (req.body.subject !== undefined) {
    if (
      typeof req.body.subject !== "string" ||
      !req.body.subject.trim()
    ) {
      return res.status(400).json({
        message:
          "Subject cannot be empty",
      });
    }

    exam.subject =
      req.body.subject.trim();
  }

  if (
    req.body.examDate !== undefined
  ) {
    const date = new Date(
      req.body.examDate
    );

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message:
          "Invalid exam date",
      });
    }

    exam.examDate =
      req.body.examDate;
  }

  res.json(exam);
});

// ------------------------------------
// DELETE EXAM
// ------------------------------------

app.delete("/api/exams/:id", (req, res) => {
  const id = Number(req.params.id);

  const examExists = exams.some(
    (exam) => exam.id === id
  );

  if (!examExists) {
    return res.status(404).json({
      message: "Exam not found",
    });
  }

  exams = exams.filter(
    (exam) => exam.id !== id
  );

  res.json({
    message:
      "Exam deleted successfully",
  });
});

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
    // Get live tasks from PostgreSQL.
    const tasks = await getTasks();

    // Exams are still in memory for now.
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