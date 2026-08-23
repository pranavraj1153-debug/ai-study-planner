/**
 * Calculate the number of whole days between today
 * and an exam date.
 */
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

/**
 * Find the exam that matches a task's subject.
 */
function findExamForSubject(subject, exams) {
  if (!subject || !Array.isArray(exams)) {
    return undefined;
  }

  return exams.find(
    (exam) =>
      exam.subject?.trim().toLowerCase() ===
      subject.trim().toLowerCase()
  );
}

/**
 * Convert difficulty into a numeric score.
 */
function getDifficultyScore(difficulty) {
  const scores = {
    easy: 0,
    medium: 10,
    hard: 20,
  };

  return scores[difficulty] ?? 10;
}

/**
 * Convert user priority into a numeric score.
 */
function getPriorityScore(priority) {
  const scores = {
    low: 0,
    medium: 10,
    high: 20,
  };

  return scores[priority] ?? 10;
}

/**
 * Calculate exam urgency.
 *
 * Closer exam = higher score.
 */
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

/**
 * Calculate total task priority.
 */
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

/**
 * Calculate how much work is still remaining.
 *
 * Example:
 * estimatedMinutes = 90
 * completedMinutes = 60
 *
 * remainingMinutes = 30
 */
function getRemainingMinutes(task) {
  const estimatedMinutes =
    Number(task.estimatedMinutes) || 60;

  const completedMinutes =
    Number(task.completedMinutes) || 0;

  return Math.max(
    estimatedMinutes - completedMinutes,
    0
  );
}

/**
 * Generate an adaptive study plan.
 */
function generateStudyPlan(
  tasks,
  exams,
  availableHours
) {
  if (!Array.isArray(tasks)) {
    throw new Error(
      "Tasks must be an array"
    );
  }

  if (!Array.isArray(exams)) {
    throw new Error(
      "Exams must be an array"
    );
  }

  if (
    typeof availableHours !== "number" ||
    !Number.isFinite(availableHours) ||
    availableHours <= 0
  ) {
    throw new Error(
      "Available study hours must be a positive number"
    );
  }

  // Only unfinished tasks should be considered.
  const incompleteTasks = tasks.filter(
    (task) => !task.completed
  );

  // Add priority and remaining-work information.
  const prioritizedTasks =
    incompleteTasks.map((task) => {
      const exam =
        findExamForSubject(
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

        remainingMinutes:
          getRemainingMinutes(task),

        daysUntilExam: exam
          ? getDaysUntilExam(
              exam.examDate
            )
          : null,
      };
    });

  // Highest priority first.
  prioritizedTasks.sort(
    (a, b) =>
      b.priorityScore -
      a.priorityScore
  );

  // Convert hours into minutes.
  const availableMinutes =
    Math.round(
      availableHours * 60
    );

  const studyPlan = [];

  let remainingAvailableMinutes =
    availableMinutes;

  for (const task of prioritizedTasks) {
    if (
      remainingAvailableMinutes <= 0
    ) {
      break;
    }

    // No remaining work = nothing to schedule.
    if (task.remainingMinutes <= 0) {
      continue;
    }

    const allocatedMinutes =
      Math.min(
        task.remainingMinutes,
        remainingAvailableMinutes
      );

    studyPlan.push({
      taskId: task.id,
      subject: task.subject,
      timeMinutes: allocatedMinutes,
      remainingMinutes:
        task.remainingMinutes,
      priorityScore:
        task.priorityScore,
      difficulty:
        task.difficulty,
      priority:
        task.priority,
      daysUntilExam:
        task.daysUntilExam,
    });

    remainingAvailableMinutes -=
      allocatedMinutes;
  }

  return studyPlan;
}

module.exports = {
  getDaysUntilExam,
  findExamForSubject,
  calculatePriority,
  getRemainingMinutes,
  generateStudyPlan,
};