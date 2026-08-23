const express = require("express");
const cors = require("cors");
const {
  generateStudyPlan,
} = require("./services/planner");

const app = express();

// ------------------------------------
// Middleware
// ------------------------------------
app.use(cors());
app.use(express.json());

// ==================================================
// TASK DATA
// ==================================================

let tasks = [
  {
    id: 1,
    subject: "Mathematics",
    time: "9:00 - 10:00",
    estimatedMinutes: 60,
    difficulty: "medium",
    priority: "medium",
    completed: false,
  },
  {
    id: 2,
    subject: "Data Structures",
    time: "10:30 - 11:30",
    estimatedMinutes: 60,
    difficulty: "hard",
    priority: "high",
    completed: false,
  },
  {
    id: 3,
    subject: "Database Systems",
    time: "2:00 - 3:00",
    estimatedMinutes: 60,
    difficulty: "medium",
    priority: "medium",
    completed: false,
  },
];

// ==================================================
// EXAM DATA
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
// TASK ROUTES
// ==================================================

// GET ALL TASKS
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// GET SINGLE TASK
app.get("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find(
    (task) => task.id === id
  );

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  res.json(task);
});

// CREATE NEW TASK
app.post("/api/tasks", (req, res) => {
  const {
    subject,
    time,
    estimatedMinutes = 60,
    difficulty = "medium",
    priority = "medium",
  } = req.body;

  if (!subject || !subject.trim()) {
    return res.status(400).json({
      message: "Subject is required",
    });
  }

  if (!time || !time.trim()) {
    return res.status(400).json({
      message: "Time is required",
    });
  }

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

  const validDifficulties = [
    "easy",
    "medium",
    "hard",
  ];

  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({
      message:
        "difficulty must be easy, medium, or hard",
    });
  }

  const validPriorities = [
    "low",
    "medium",
    "high",
  ];

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      message:
        "priority must be low, medium, or high",
    });
  }

  const newTask = {
    id:
      tasks.length > 0
        ? Math.max(
            ...tasks.map((task) => task.id)
          ) + 1
        : 1,

    subject: subject.trim(),
    time: time.trim(),
    estimatedMinutes: minutes,
    difficulty,
    priority,
    completed: false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// UPDATE TASK
app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find(
    (task) => task.id === id
  );

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  if (req.body.subject !== undefined) {
    if (
      typeof req.body.subject !== "string" ||
      !req.body.subject.trim()
    ) {
      return res.status(400).json({
        message: "Subject cannot be empty",
      });
    }

    task.subject = req.body.subject.trim();
  }

  if (req.body.time !== undefined) {
    if (
      typeof req.body.time !== "string" ||
      !req.body.time.trim()
    ) {
      return res.status(400).json({
        message: "Time cannot be empty",
      });
    }

    task.time = req.body.time.trim();
  }

  if (req.body.estimatedMinutes !== undefined) {
    const minutes = Number(
      req.body.estimatedMinutes
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

    task.estimatedMinutes = minutes;
  }

  if (req.body.difficulty !== undefined) {
    const validDifficulties = [
      "easy",
      "medium",
      "hard",
    ];

    if (
      !validDifficulties.includes(
        req.body.difficulty
      )
    ) {
      return res.status(400).json({
        message:
          "difficulty must be easy, medium, or hard",
      });
    }

    task.difficulty = req.body.difficulty;
  }

  if (req.body.priority !== undefined) {
    const validPriorities = [
      "low",
      "medium",
      "high",
    ];

    if (
      !validPriorities.includes(
        req.body.priority
      )
    ) {
      return res.status(400).json({
        message:
          "priority must be low, medium, or high",
      });
    }

    task.priority = req.body.priority;
  }

  if (req.body.completed !== undefined) {
    task.completed = Boolean(
      req.body.completed
    );
  }

  res.json(task);
});

// DELETE TASK
app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const taskExists = tasks.some(
    (task) => task.id === id
  );

  if (!taskExists) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  tasks = tasks.filter(
    (task) => task.id !== id
  );

  res.json({
    message: "Task deleted successfully",
  });
});

// ==================================================
// EXAM ROUTES
// ==================================================

// GET ALL EXAMS
app.get("/api/exams", (req, res) => {
  res.json(exams);
});

// GET SINGLE EXAM
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

// CREATE NEW EXAM
app.post("/api/exams", (req, res) => {
  const { subject, examDate } = req.body;

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
            ...exams.map((exam) => exam.id)
          ) + 1
        : 1,

    subject: subject.trim(),
    examDate,
  };

  exams.push(newExam);

  res.status(201).json(newExam);
});

// UPDATE EXAM
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

    exam.subject = req.body.subject.trim();
  }

  if (req.body.examDate !== undefined) {
    const date = new Date(
      req.body.examDate
    );

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid exam date",
      });
    }

    exam.examDate =
      req.body.examDate;
  }

  res.json(exam);
});

// DELETE EXAM
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

app.post("/api/study-plan", (req, res) => {
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