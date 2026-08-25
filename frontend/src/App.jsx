import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newSubject, setNewSubject] = useState("");
  const [newTime, setNewTime] = useState("");

  // ==========================================
  // TIME-BASED GREETING
  // ==========================================

  const [currentHour, setCurrentHour] = useState(
    new Date().getHours()
  );

  useEffect(() => {
    const updateTime = () => {
      setCurrentHour(new Date().getHours());
    };

    // Check the time every minute
    const timer = setInterval(updateTime, 60000);

    return () => clearInterval(timer);
  }, []);

  let greeting;
  let greetingEmoji;

  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good morning";
    greetingEmoji = "🌅";
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
    greetingEmoji = "☀️";
  } else if (currentHour >= 17 && currentHour < 21) {
    greeting = "Good evening";
    greetingEmoji = "🌇";
  } else {
    greeting = "Good night";
    greetingEmoji = "🌙";
  }

  // ==========================================
  // LOAD TASKS FROM BACKEND
  // ==========================================

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const data = await response.json();

        setTasks(data);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // ==========================================
  // CLICK / TOUCH EFFECT
  // ==========================================

  useEffect(() => {
    const handlePointerDown = (event) => {
      const effect = document.createElement("div");

      effect.className = "click-effect";

      effect.style.left = `${event.clientX}px`;
      effect.style.top = `${event.clientY}px`;

      document.body.appendChild(effect);

      setTimeout(() => {
        effect.remove();
      }, 700);
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, []);

  // ==========================================
  // TOGGLE TASK
  // ==========================================

  const toggleTask = async (id) => {
    const task = tasks.find((task) => task.id === id);

    if (!task) return;

    const oldCompleted = task.completed;
    const updatedCompleted = !oldCompleted;

    // Update screen immediately
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: updatedCompleted,
            }
          : task
      )
    );

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: updatedCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      );
    } catch (err) {
      console.error(err);

      // Restore old state
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: oldCompleted,
              }
            : task
        )
      );

      setError("Could not save the task.");
    }
  };

  // ==========================================
  // ADD TASK
  // ==========================================

  const addTask = async (event) => {
    event.preventDefault();

    if (
      !newSubject.trim() ||
      !newTime.trim()
    ) {
      setError(
        "Please enter both subject and time."
      );

      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: newSubject,
          time: newTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const newTask = await response.json();

      setTasks((currentTasks) => [
        ...currentTasks,
        newTask,
      ]);

      setNewSubject("");
      setNewTime("");
    } catch (err) {
      console.error(err);

      setError("Could not add the task.");
    }
  };

  // ==========================================
  // DELETE TASK
  // ==========================================

  const deleteTask = async (id) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== id
        )
      );
    } catch (err) {
      console.error(err);

      setError("Could not delete the task.");
    }
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div>
          <h1>AI Study Planner</h1>

          <p>
            Your intelligent study space
          </p>
        </div>

        <nav>
          <a href="#dashboard">
            Dashboard
          </a>

          <a href="#tasks">
            Tasks
          </a>

          <a href="#exams">
            Exams
          </a>
        </nav>

      </header>

      {/* MAIN DASHBOARD */}

      <main
        className="dashboard"
        id="dashboard"
      >

        {/* GREETING */}

        <section className="welcome">

          <div>

            <h2>
              {greeting} {greetingEmoji}
            </h2>

            <p>
              Let's make today productive.
            </p>

          </div>

          <div className="progress-badge">

            <span>
              Today's Progress
            </span>

            <strong>
              {progress}%
            </strong>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <section className="stats">

          <div className="stat-card">

            <span className="stat-icon">
              📚
            </span>

            <div>

              <h3>
                Today's Tasks
              </h3>

              <strong>
                {totalTasks}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              ✅
            </span>

            <div>

              <h3>
                Completed
              </h3>

              <strong>
                {completedTasks}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              🎯
            </span>

            <div>

              <h3>
                Progress
              </h3>

              <strong>
                {progress}%
              </strong>

            </div>

          </div>

        </section>

        {/* ADD TASK */}

        <section
          className="add-task"
          id="tasks"
        >

          <h2>
            Add a New Task
          </h2>

          <form onSubmit={addTask}>

            <input
              type="text"
              placeholder="Subject"
              value={newSubject}
              onChange={(event) =>
                setNewSubject(
                  event.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Time e.g. 4:00 - 5:00"
              value={newTime}
              onChange={(event) =>
                setNewTime(
                  event.target.value
                )
              }
            />

            <button type="submit">
              + Add Task
            </button>

          </form>

        </section>

        {/* STUDY PLAN */}

        <section className="study-plan">

          <div className="section-heading">

            <div>

              <h2>
                Today's Study Plan
              </h2>

              <p>
                Stay focused and complete your
                goals.
              </p>

            </div>

            <span className="task-count">
              {completedTasks}/{totalTasks} completed
            </span>

          </div>

          {loading ? (

            <p className="empty-message">
              Loading tasks...
            </p>

          ) : tasks.length === 0 ? (

            <p className="empty-message">
              No tasks available. Add your first
              task above.
            </p>

          ) : (

            <div className="task-list">

              {tasks.map((task) => (

                <div
                  className={`task ${
                    task.completed
                      ? "completed"
                      : ""
                  }`}
                  key={task.id}
                >

                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      toggleTask(task.id)
                    }
                  />

                  <div className="task-info">

                    <strong>
                      {task.subject}
                    </strong>

                    <small>
                      {task.time}
                    </small>

                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                    type="button"
                  >
                    Delete
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* PROGRESS */}

        <section className="progress-section">

          <div className="progress-card">

            <div>

              <h2>
                Study Progress
              </h2>

              <p>
                You've completed{" "}
                {completedTasks} out of{" "}
                {totalTasks} tasks.
              </p>

            </div>

            <div className="progress-circle">

              <div
                className="progress-circle-inner"
                style={{
                  background:
                    `conic-gradient(
                      #7c3aed ${progress}%,
                      #e9e5ff ${progress}% 100%
                    )`,
                }}
              >

                <span>
                  {progress}%
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* UPCOMING EXAMS */}

        <section
          className="exams"
          id="exams"
        >

          <h2>
            Upcoming Exams
          </h2>

          <div className="exam-list">

            <div className="exam">

              <span>
                📘 Data Structures
              </span>

              <strong>
                12 days
              </strong>

            </div>

            <div className="exam">

              <span>
                💾 Database Systems
              </span>

              <strong>
                18 days
              </strong>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;