const pool = require("./connection");

// ------------------------------------
// Development user
// ------------------------------------

async function getDevelopmentUser() {
  const email = process.env.DEV_USER_EMAIL;

  if (!email) {
    throw new Error(
      "DEV_USER_EMAIL is missing from backend/.env"
    );
  }

  const result = await pool.query(
    `
    SELECT id, name, email
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `Development user not found: ${email}`
    );
  }

  return result.rows[0];
}

// ------------------------------------
// Convert database task row
// to API-friendly object
// ------------------------------------

function mapTask(row) {
  return {
    id: Number(row.id),
    subject: row.subject,
    time: row.time,
    estimatedMinutes: row.estimated_minutes,
    completedMinutes: row.completed_minutes,
    difficulty: row.difficulty,
    priority: row.priority,
    completed: row.completed,
  };
}

// ------------------------------------
// GET ALL TASKS
// ------------------------------------

async function getTasks() {
  const user = await getDevelopmentUser();

  const result = await pool.query(
    `
    SELECT
      id,
      subject,
      time,
      estimated_minutes,
      completed_minutes,
      difficulty,
      priority,
      completed
    FROM tasks
    WHERE user_id = $1
    ORDER BY id ASC
    `,
    [user.id]
  );

  return result.rows.map(mapTask);
}

// ------------------------------------
// GET SINGLE TASK
// ------------------------------------

async function getTaskById(id) {
  const user = await getDevelopmentUser();

  const result = await pool.query(
    `
    SELECT
      id,
      subject,
      time,
      estimated_minutes,
      completed_minutes,
      difficulty,
      priority,
      completed
    FROM tasks
    WHERE id = $1
      AND user_id = $2
    LIMIT 1
    `,
    [id, user.id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapTask(result.rows[0]);
}

// ------------------------------------
// CREATE TASK
// ------------------------------------

async function createTask({
  subject,
  time,
  estimatedMinutes,
  completedMinutes,
  difficulty,
  priority,
}) {
  const user = await getDevelopmentUser();

  const completed =
    Number(completedMinutes) >=
    Number(estimatedMinutes);

  const result = await pool.query(
    `
    INSERT INTO tasks (
      user_id,
      subject,
      time,
      estimated_minutes,
      completed_minutes,
      difficulty,
      priority,
      completed
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    )
    RETURNING
      id,
      subject,
      time,
      estimated_minutes,
      completed_minutes,
      difficulty,
      priority,
      completed
    `,
    [
      user.id,
      subject,
      time,
      estimatedMinutes,
      completedMinutes,
      difficulty,
      priority,
      completed,
    ]
  );

  return mapTask(result.rows[0]);
}

// ------------------------------------
// UPDATE TASK
// ------------------------------------

async function updateTask(
  id,
  updates
) {
  const user = await getDevelopmentUser();

  const existingTask =
    await getTaskById(id);

  if (!existingTask) {
    return null;
  }

  const subject =
    updates.subject !== undefined
      ? updates.subject
      : existingTask.subject;

  const time =
    updates.time !== undefined
      ? updates.time
      : existingTask.time;

  const estimatedMinutes =
    updates.estimatedMinutes !== undefined
      ? updates.estimatedMinutes
      : existingTask.estimatedMinutes;

  const completedMinutes =
    updates.completedMinutes !== undefined
      ? updates.completedMinutes
      : existingTask.completedMinutes;

  const difficulty =
    updates.difficulty !== undefined
      ? updates.difficulty
      : existingTask.difficulty;

  const priority =
    updates.priority !== undefined
      ? updates.priority
      : existingTask.priority;

  let completed = existingTask.completed;

  if (updates.completed !== undefined) {
    completed = Boolean(
      updates.completed
    );
  }

  if (
    completedMinutes >=
    estimatedMinutes
  ) {
    completed = true;
  }

  if (completed) {
    // If a task is manually completed,
    // count the entire task as studied.
    const finalCompletedMinutes =
      estimatedMinutes;

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        subject = $1,
        time = $2,
        estimated_minutes = $3,
        completed_minutes = $4,
        difficulty = $5,
        priority = $6,
        completed = TRUE
      WHERE id = $7
        AND user_id = $8
      RETURNING
        id,
        subject,
        time,
        estimated_minutes,
        completed_minutes,
        difficulty,
        priority,
        completed
      `,
      [
        subject,
        time,
        estimatedMinutes,
        finalCompletedMinutes,
        difficulty,
        priority,
        id,
        user.id,
      ]
    );

    return result.rows.length > 0
      ? mapTask(result.rows[0])
      : null;
  }

  const result = await pool.query(
    `
    UPDATE tasks
    SET
      subject = $1,
      time = $2,
      estimated_minutes = $3,
      completed_minutes = $4,
      difficulty = $5,
      priority = $6,
      completed = FALSE
    WHERE id = $7
      AND user_id = $8
    RETURNING
      id,
      subject,
      time,
      estimated_minutes,
      completed_minutes,
      difficulty,
      priority,
      completed
    `,
    [
      subject,
      time,
      estimatedMinutes,
      completedMinutes,
      difficulty,
      priority,
      id,
      user.id,
    ]
  );

  return result.rows.length > 0
    ? mapTask(result.rows[0])
    : null;
}

// ------------------------------------
// DELETE TASK
// ------------------------------------

async function deleteTask(id) {
  const user = await getDevelopmentUser();

  const result = await pool.query(
    `
    DELETE FROM tasks
    WHERE id = $1
      AND user_id = $2
    RETURNING id
    `,
    [id, user.id]
  );

  return result.rows.length > 0;
}

module.exports = {
  getDevelopmentUser,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};