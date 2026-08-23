const {
  generateStudyPlan,
} = require("./services/planner");

const tasks = [
  {
    id: 1,
    subject: "Data Structures",
    estimatedMinutes: 90,
    completedMinutes: 60,
    difficulty: "hard",
    priority: "high",
    completed: false,
  },
  {
    id: 2,
    subject: "Database Systems",
    estimatedMinutes: 60,
    completedMinutes: 0,
    difficulty: "medium",
    priority: "medium",
    completed: false,
  },
  {
    id: 3,
    subject: "Mathematics",
    estimatedMinutes: 30,
    completedMinutes: 0,
    difficulty: "easy",
    priority: "low",
    completed: false,
  },
];

const exams = [
  {
    id: 1,
    subject: "Data Structures",
    examDate: "2026-08-26",
  },
  {
    id: 2,
    subject: "Database Systems",
    examDate: "2026-09-05",
  },
];

const plan = generateStudyPlan(
  tasks,
  exams,
  1
);

console.log("Generated Adaptive Study Plan:");
console.table(plan);