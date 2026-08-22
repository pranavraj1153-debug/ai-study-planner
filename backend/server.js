const express = require("express");
const cors = require("cors");

const app = express();

// ------------------------------------
// Middleware
// ------------------------------------
app.use(cors());
app.use(express.json());

// ------------------------------------
// Temporary in-memory task data
// ------------------------------------
let tasks = [
  {
    id: 1,
    subject: "Mathematics",
    time: "9:00 - 10:00",
    completed: false,
  },
  {
    id: 2,
    subject: "Data Structures",
    time: "10:30 - 11:30",
    completed: false,
  },
  {
    id: 3,
    subject: "Database Systems",
    time: "2:00 - 3:00",
    completed: false,
  },
];

// ------------------------------------
// HOME ROUTE
// ------------------------------------
app.get("/", (req, res) => {
  res.json({
    message: "AI Study Planner API is running!",
  });
});

// ------------------------------------
// GET ALL TASKS
// ------------------------------------
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// ------------------------------------
// GET SINGLE TASK
// ------------------------------------
app.get("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  res.json(task);
});

// ------------------------------------
// CREATE NEW TASK
// ------------------------------------
app.post("/api/tasks", (req, res) => {
  const { subject, time } = req.body;

  // Validate input
  if (!subject || !time) {
    return res.status(400).json({
      message: "Subject and time are required",
    });
  }

  const newTask = {
    id:
      tasks.length > 0
        ? Math.max(...tasks.map((task) => task.id)) + 1
        : 1,
    subject: subject.trim(),
    time: time.trim(),
    completed: false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// ------------------------------------
// UPDATE TASK
// ------------------------------------
app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  // Update subject if provided
  if (req.body.subject !== undefined) {
    if (!req.body.subject.trim()) {
      return res.status(400).json({
        message: "Subject cannot be empty",
      });
    }

    task.subject = req.body.subject.trim();
  }

  // Update time if provided
  if (req.body.time !== undefined) {
    if (!req.body.time.trim()) {
      return res.status(400).json({
        message: "Time cannot be empty",
      });
    }

    task.time = req.body.time.trim();
  }

  // Update completion status if provided
  if (req.body.completed !== undefined) {
    task.completed = Boolean(req.body.completed);
  }

  res.json(task);
});

// ------------------------------------
// DELETE TASK
// ------------------------------------
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

// ------------------------------------
// START SERVER
// ------------------------------------
const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});