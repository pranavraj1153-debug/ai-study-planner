const {
  generateStudyPlan,
} = require("./services/planner");

const tasks = [
  {
    id: 1,
    subject: "Data Structures",
    time: "10:30 - 11:30",
    estimatedMinutes: 90,
    difficulty: "hard",
    priority: "high",
    completed: false,
  },
  {
    id: 2,
    subject: "Database Systems",
    time: "2:00 - 3:00",
    estimatedMinutes: 60,
    difficulty: "medium",
    priority: "medium",
    completed: false,
  },
  {
    id: 3,
    subject: "Mathematics",
    time: "4:00 - 4:30",
    estimatedMinutes: 30,
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
  2
);

console.log("Generated Study Plan:");
console.table(plan);