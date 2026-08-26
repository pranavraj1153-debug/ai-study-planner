import { useEffect, useState } from "react";
import "./App.css";

const TASKS_API_URL = "http://localhost:5000/api/tasks";
const EXAMS_API_URL = "http://localhost:5000/api/exams";
const STUDY_SESSIONS_API_URL =
  "http://localhost:5000/api/study-sessions";

function App() {
  // ==================================================
  // TASK STATE
  // ==================================================

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] =
    useState(true);

  // ==================================================
  // EXAM STATE
  // ==================================================

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] =
    useState(true);

  const [examSubject, setExamSubject] =
    useState("");

  const [examDate, setExamDate] =
    useState("");

  const [addingExam, setAddingExam] =
    useState(false);

  // ==================================================
  // GENERAL ERROR STATE
  // ==================================================

  const [error, setError] = useState("");

  // ==================================================
  // TASK FORM STATE
  // ==================================================

  const [subject, setSubject] =
    useState("");

  const [time, setTime] =
    useState("");

  const [addingTask, setAddingTask] =
    useState(false);

  // ==================================================
  // LOAD TASKS
  // ==================================================

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          TASKS_API_URL
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load tasks"
          );
        }

        const data =
          await response.json();

        setTasks(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load tasks from the backend."
        );
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  // ==================================================
  // LOAD EXAMS
  // ==================================================

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(
          EXAMS_API_URL
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load exams"
          );
        }

        const data =
          await response.json();

        setExams(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load exams from the backend."
        );
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  // ==================================================
  // CALCULATE DAYS UNTIL EXAM
  // ==================================================

  const getDaysUntilExam = (
    examDateValue
  ) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const exam = new Date(
      `${examDateValue}T00:00:00`
    );

    exam.setHours(0, 0, 0, 0);

    const difference =
      exam.getTime() -
      today.getTime();

    const days = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (days < 0) {
      return "Passed";
    }

    if (days === 0) {
      return "Today";
    }

    if (days === 1) {
      return "1 day";
    }

    return `${days} days`;
  };

  // ==================================================
  // TOGGLE TASK COMPLETION
  // ==================================================

  const toggleTask = async (id) => {
    const task = tasks.find(
      (task) => task.id === id
    );

    if (!task) return;

    const oldCompleted =
      task.completed;

    const oldCompletedMinutes =
      task.completedMinutes;

    const updatedCompleted =
      !oldCompleted;

    const updatedCompletedMinutes =
      updatedCompleted
        ? task.estimatedMinutes
        : 0;

    // Update UI immediately
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed:
                updatedCompleted,
              completedMinutes:
                updatedCompletedMinutes,
            }
          : task
      )
    );

    try {
      const response = await fetch(
        `${TASKS_API_URL}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            completed:
              updatedCompleted,
            completedMinutes:
              updatedCompletedMinutes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update task"
        );
      }

      const updatedTask =
        await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id
            ? updatedTask
            : task
        )
      );

      setError("");
    } catch (err) {
      console.error(err);

      // Restore previous state
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed:
                  oldCompleted,
                completedMinutes:
                  oldCompletedMinutes,
              }
            : task
        )
      );

      setError(
        "Could not save the task."
      );

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  // ==================================================
  // ADD TASK
  // ==================================================

  const addTask = async (event) => {
    event.preventDefault();

    if (
      !subject.trim() ||
      !time.trim()
    ) {
      setError(
        "Please enter both subject and time."
      );

      return;
    }

    setAddingTask(true);
    setError("");

    try {
      const response = await fetch(
        TASKS_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            subject:
              subject.trim(),
            time: time.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to add task"
        );
      }

      const newTask =
        await response.json();

      setTasks((currentTasks) => [
        ...currentTasks,
        newTask,
      ]);

      setSubject("");
      setTime("");
    } catch (err) {
      console.error(err);

      setError(
        "Could not add the task."
      );
    } finally {
      setAddingTask(false);
    }
  };

  // ==================================================
  // DELETE TASK
  // ==================================================

  const deleteTask = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${TASKS_API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete task"
        );
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== id
        )
      );

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        "Could not delete the task."
      );

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  // ==================================================
  // RECORD STUDY SESSION
  // ==================================================

  const recordStudySession = async (
    taskId,
    minutes
  ) => {
    const task = tasks.find(
      (task) => task.id === taskId
    );

    if (!task) return;

    const remainingMinutes =
      task.estimatedMinutes -
      task.completedMinutes;

    if (remainingMinutes <= 0) {
      setError(
        "This task is already completed."
      );

      return;
    }

    // Never allow a session to exceed
    // the remaining task time.
    const sessionMinutes = Math.min(
      minutes,
      remainingMinutes
    );

    try {
      const response = await fetch(
        STUDY_SESSIONS_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            taskId,
            minutes:
              sessionMinutes,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.message ||
            "Failed to record study session"
        );
      }

      // Reload tasks from PostgreSQL.
      const tasksResponse =
        await fetch(TASKS_API_URL);

      if (!tasksResponse.ok) {
        throw new Error(
          "Failed to refresh tasks"
        );
      }

      const updatedTasks =
        await tasksResponse.json();

      setTasks(updatedTasks);
      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not record study session."
      );

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  // ==================================================
  // ADD EXAM
  // ==================================================

  const addExam = async (event) => {
    event.preventDefault();

    if (
      !examSubject.trim() ||
      !examDate
    ) {
      setError(
        "Please enter the exam subject and date."
      );

      return;
    }

    setAddingExam(true);
    setError("");

    try {
      const response = await fetch(
        EXAMS_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            subject:
              examSubject.trim(),
            examDate,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.message ||
            "Failed to add exam"
        );
      }

      const newExam =
        await response.json();

      setExams((currentExams) =>
        [
          ...currentExams,
          newExam,
        ].sort((a, b) =>
          a.examDate.localeCompare(
            b.examDate
          )
        )
      );

      setExamSubject("");
      setExamDate("");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not add the exam."
      );
    } finally {
      setAddingExam(false);
    }
  };

  // ==================================================
  // DELETE EXAM
  // ==================================================

  const deleteExam = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this exam?"
      );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${EXAMS_API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.message ||
            "Failed to delete exam"
        );
      }

      setExams((currentExams) =>
        currentExams.filter(
          (exam) => exam.id !== id
        )
      );

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not delete the exam."
      );

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  // ==================================================
  // STATISTICS
  // ==================================================

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const totalTasks =
    tasks.length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks /
            totalTasks) *
            100
        );

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <h1>
          AI Study Planner
        </h1>

        <nav>
          <a href="#">
            Dashboard
          </a>

          <a href="#">
            Tasks
          </a>

          <a href="#">
            Exams
          </a>
        </nav>
      </header>

      <main className="dashboard">

        {/* Welcome */}
        <section className="welcome">
          <h2>
            Good morning 👋
          </h2>

          <p>
            Let's make today productive.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding:
                "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="stats">

          <div className="stat-card">
            <h3>
              Today's Tasks
            </h3>

            <strong>
              {totalTasks}
            </strong>
          </div>

          <div className="stat-card">
            <h3>
              Completed
            </h3>

            <strong>
              {completedTasks}
            </strong>
          </div>

          <div className="stat-card">
            <h3>
              Progress
            </h3>

            <strong>
              {progress}%
            </strong>
          </div>

        </section>

        {/* ==================================================
            TASK SECTION
        ================================================== */}

        <section className="study-plan">

          <h2>
            Today's Study Plan
          </h2>

          {/* Add Task Form */}
          <form
            onSubmit={addTask}
            style={{
              display:
                "flex",
              gap: "10px",
              flexWrap:
                "wrap",
              marginBottom:
                "25px",
              padding: "20px",
              background:
                "#f8fafc",
              borderRadius:
                "12px",
            }}
          >
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) =>
                setSubject(
                  e.target.value
                )
              }
              style={{
                flex: "1",
                minWidth:
                  "180px",
                padding:
                  "12px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "8px",
                fontSize:
                  "15px",
              }}
            />

            <input
              type="text"
              placeholder="Time e.g. 4:00 - 5:00"
              value={time}
              onChange={(e) =>
                setTime(
                  e.target.value
                )
              }
              style={{
                flex: "1",
                minWidth:
                  "180px",
                padding:
                  "12px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "8px",
                fontSize:
                  "15px",
              }}
            />

            <button
              type="submit"
              disabled={addingTask}
              style={{
                padding:
                  "12px 20px",
                background:
                  "#2563eb",
                color:
                  "white",
                border:
                  "none",
                borderRadius:
                  "8px",
                cursor:
                  addingTask
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "600",
              }}
            >
              {addingTask
                ? "Adding..."
                : "+ Add Task"}
            </button>
          </form>

          {/* ==================================================
              TASK LIST
          ================================================== */}

          {loadingTasks ? (
            <p>
              Loading tasks...
            </p>
          ) : tasks.length === 0 ? (
            <p>
              No tasks available.
            </p>
          ) : (
            tasks.map((task) => {
              const remainingMinutes =
                Math.max(
                  task.estimatedMinutes -
                    task.completedMinutes,
                  0
                );

              return (
                <div
                  className="task"
                  key={task.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "40px minmax(0, 1fr) auto",
                    gap: "16px",
                    alignItems:
                      "center",
                    padding:
                      "18px 10px",
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={
                      task.completed
                    }
                    onChange={() =>
                      toggleTask(
                        task.id
                      )
                    }
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />

                  {/* Main task information */}
                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "5px",
                      minWidth: 0,
                    }}
                  >
                    {/* Subject */}
                    <span
                      style={{
                        fontSize:
                          "18px",
                        fontWeight:
                          "500",
                        textDecoration:
                          task.completed
                            ? "line-through"
                            : "none",
                        opacity:
                          task.completed
                            ? 0.5
                            : 1,
                      }}
                    >
                      {task.subject}
                    </span>

                    {/* Scheduled time */}
                    <small
                      style={{
                        color:
                          "#6b7280",
                      }}
                    >
                      {task.time}
                    </small>

                    {/* Progress */}
                    <div
                      style={{
                        marginTop:
                          "6px",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        gap: "3px",
                      }}
                    >
                      <small>
                        Progress:{" "}
                        {
                          task.completedMinutes
                        }{" "}
                        /{" "}
                        {
                          task.estimatedMinutes
                        }{" "}
                        min
                      </small>

                      {!task.completed ? (
                        <small
                          style={{
                            color:
                              "#6b7280",
                          }}
                        >
                          {
                            remainingMinutes
                          }{" "}
                          min remaining
                        </small>
                      ) : (
                        <small
                          style={{
                            color:
                              "#16a34a",
                            fontWeight:
                              "600",
                          }}
                        >
                          Completed ✅
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {/* Study session */}
                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() =>
                          recordStudySession(
                            task.id,
                            15
                          )
                        }
                        style={{
                          padding:
                            "9px 14px",
                          border:
                            "1px solid #2563eb",
                          background:
                            "#eff6ff",
                          color:
                            "#1d4ed8",
                          borderRadius:
                            "7px",
                          cursor:
                            "pointer",
                          fontSize:
                            "14px",
                          fontWeight:
                            "600",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        +15 min
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        deleteTask(
                          task.id
                        )
                      }
                      title="Delete task"
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        fontSize:
                          "20px",
                        padding:
                          "4px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}

        </section>

        {/* ==================================================
            EXAM SECTION
        ================================================== */}

        <section className="exams">

          <h2>
            Upcoming Exams
          </h2>

          {/* Add Exam Form */}
          <form
            onSubmit={addExam}
            style={{
              display:
                "flex",
              gap: "10px",
              flexWrap:
                "wrap",
              marginBottom:
                "25px",
              padding:
                "20px",
              background:
                "#f8fafc",
              borderRadius:
                "12px",
            }}
          >
            <input
              type="text"
              placeholder="Exam subject"
              value={examSubject}
              onChange={(e) =>
                setExamSubject(
                  e.target.value
                )
              }
              style={{
                flex: "1",
                minWidth:
                  "180px",
                padding:
                  "12px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "8px",
                fontSize:
                  "15px",
              }}
            />

            <input
              type="date"
              value={examDate}
              onChange={(e) =>
                setExamDate(
                  e.target.value
                )
              }
              style={{
                flex: "1",
                minWidth:
                  "180px",
                padding:
                  "12px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "8px",
                fontSize:
                  "15px",
              }}
            />

            <button
              type="submit"
              disabled={addingExam}
              style={{
                padding:
                  "12px 20px",
                background:
                  "#2563eb",
                color:
                  "white",
                border:
                  "none",
                borderRadius:
                  "8px",
                cursor:
                  addingExam
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "600",
              }}
            >
              {addingExam
                ? "Adding..."
                : "+ Add Exam"}
            </button>
          </form>

          {/* Exam List */}
          {loadingExams ? (
            <p>
              Loading exams...
            </p>
          ) : exams.length === 0 ? (
            <p>
              No upcoming exams.
            </p>
          ) : (
            exams.map((exam) => (
              <div
                className="exam"
                key={exam.id}
              >
                <div>
                  <span>
                    {exam.subject}
                  </span>

                  <small
                    style={{
                      display:
                        "block",
                      marginTop:
                        "4px",
                      color:
                        "#6b7280",
                    }}
                  >
                    Exam date:{" "}
                    {exam.examDate}
                  </small>
                </div>

                <strong>
                  {getDaysUntilExam(
                    exam.examDate
                  )}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    deleteExam(
                      exam.id
                    )
                  }
                  title="Delete exam"
                  style={{
                    marginLeft:
                      "15px",
                    border:
                      "none",
                    background:
                      "transparent",
                    cursor:
                      "pointer",
                    fontSize:
                      "20px",
                  }}
                >
                  🗑️
                </button>
              </div>
            ))
          )}

        </section>

      </main>
    </div>
  );
}

export default App;