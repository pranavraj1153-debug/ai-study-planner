function getDaysUntilExam(examDate) {
  const today = new Date();
  const exam = new Date(examDate);

  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);

  const difference = exam.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

// ------------------------------------
// Find exam matching task subject
// ------------------------------------
function findExamForSubject(subject, exams) {
  return exams.find(
    (exam) =>
      exam.subject.trim().toLowerCase() ===
      subject.trim().toLowerCase()
  );
}

// ------------------------------------
// Difficulty score
// ------------------------------------
function getDifficultyScore(difficulty) {
  const scores = {
    easy: 0,
    medium: 10,
    hard: 20,
  };

  return scores[difficulty] ?? 10;
}

// ------------------------------------
// Priority score
// ------------------------------------
function getPriorityScore(priority) {
  const scores = {
    low: 0,
    medium: 10,
    high: 20,
  };

  return scores[priority] ?? 10;
}

// ------------------------------------
// Exam urgency score
// ------------------------------------
function getExamUrgencyScore(exam) {
  if (!exam) {
    return 10;
  }

  const daysUntilExam = getDaysUntilExam(
    exam.examDate
  );

  if (daysUntilExam < 0) {
    return 5;
  }

  if (daysUntilExam <= 2) {
    return 100;
  }

  if (daysUntilExam <= 5) {
    return 80;
  }

  if (daysUntilExam <= 10) {
    return 60;
  }

  if (daysUntilExam <= 20) {
    return 40;
  }

  return 20;
}

// ------------------------------------
// Calculate total task priority
// ------------------------------------
function calculatePriority(task, exams) {
  if (task.completed) {
    return 0;
  }

  const exam = findExamForSubject(
    task.subject,
    exams
  );

  const examScore =
    getExamUrgencyScore(exam);

  const difficultyScore =
    getDifficultyScore(task.difficulty);

  const priorityScore =
    getPriorityScore(task.priority);

  return (
    examScore +
    difficultyScore +
    priorityScore
  );
}

// ------------------------------------
// Generate study plan
// ------------------------------------
function generateStudyPlan(
  tasks,
  exams,
  availableHours
) {
  if (!Array.isArray(tasks)) {
    throw new Error("Tasks must be an array");
  }

  if (!Array.isArray(exams)) {
    throw new Error("Exams must be an array");
  }

  if (
    typeof availableHours !== "number" ||
    availableHours <= 0
  ) {
    throw new Error(
      "Available study hours must be a positive number"
    );
  }

  // Only unfinished tasks should be planned.
  const incompleteTasks = tasks.filter(
    (task) => !task.completed
  );

  // Add planning information to every task.
  const prioritizedTasks = incompleteTasks.map(
    (task) => {
      const exam = findExamForSubject(
        task.subject,
        exams
      );

      return {
        ...task,

        priorityScore:
          calculatePriority(
            task,
            exams
          ),

        daysUntilExam: exam
          ? getDaysUntilExam(
              exam.examDate
            )
          : null,
      };
    }
  );

  // Highest priority first.
  prioritizedTasks.sort(
    (a, b) =>
      b.priorityScore -
      a.priorityScore
  );

  const availableMinutes =
    Math.round(
      availableHours * 60
    );

  const studyPlan = [];

  let remainingMinutes =
    availableMinutes;

  for (const task of prioritizedTasks) {
    if (remainingMinutes <= 0) {
      break;
    }

    // Use the task's estimated duration.
    const taskMinutes =
      Number(task.estimatedMinutes) || 60;

    const allocatedMinutes =
      Math.min(
        taskMinutes,
        remainingMinutes
      );

    studyPlan.push({
      taskId: task.id,
      subject: task.subject,
      timeMinutes: allocatedMinutes,
      priorityScore: task.priorityScore,
      difficulty: task.difficulty,
      priority: task.priority,
      daysUntilExam: task.daysUntilExam,
    });

    remainingMinutes -=
      allocatedMinutes;
  }

  return studyPlan;
}

module.exports = {
  getDaysUntilExam,
  findExamForSubject,
  calculatePriority,
  generateStudyPlan,
};