/**
 * Calculate the number of whole days between today
 * and an exam date.
 */
function getDaysUntilExam(examDate) {
  const today = new Date();
  const exam = new Date(examDate);

  // Remove the time component so comparisons
  // are consistent.
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
 *
 * Hard = highest
 * Medium = middle
 * Easy = lowest
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
 * Calculate how urgent an exam is.
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

  // Exam has already passed.
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
 * Calculate the total priority score for a task.
 *
 * The score combines:
 * - Exam urgency
 * - Task difficulty
 * - User priority
 */
function calculatePriority(task, exams) {
  // Completed tasks should not be scheduled.
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
 * Generate a study plan.
 *
 * @param {Array} tasks
 * @param {Array} exams
 * @param {number} availableHours
 * @returns {Array} prioritized study plan
 */
function generateStudyPlan(
  tasks,
  exams,
  availableHours
) {
  // Validate tasks.
  if (!Array.isArray(tasks)) {
    throw new Error(
      "Tasks must be an array"
    );
  }

  // Validate exams.
  if (!Array.isArray(exams)) {
    throw new Error(
      "Exams must be an array"
    );
  }

  // Validate available study time.
  if (
    typeof availableHours !== "number" ||
    !Number.isFinite(availableHours) ||
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

  // Add planning information to each task.
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

  let remainingMinutes =
    availableMinutes;

  // Allocate study time according
  // to priority.
  for (const task of prioritizedTasks) {
    if (remainingMinutes <= 0) {
      break;
    }

    // Use the estimated task duration.
    // Fall back to 60 minutes if missing.
    const taskMinutes =
      Number(task.estimatedMinutes) || 60;

    // Don't allocate more time than
    // the student has available.
    const allocatedMinutes =
      Math.min(
        taskMinutes,
        remainingMinutes
      );

    studyPlan.push({
      taskId: task.id,
      subject: task.subject,
      timeMinutes: allocatedMinutes,
      priorityScore:
        task.priorityScore,
      difficulty: task.difficulty,
      priority: task.priority,
      daysUntilExam:
        task.daysUntilExam,
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