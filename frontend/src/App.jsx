import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newSubject, setNewSubject] = useState("");
  const [newTime, setNewTime] = useState("");

  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // ==========================================
  // DYNAMIC TIME + GREETING
  // ==========================================

  const updateGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    let message;

    if (hour >= 5 && hour < 12) {
      message = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      message = "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
      message = "Good evening";
    } else {
      message = "Good night";
    }

    setGreeting(message);

    setCurrentTime(
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  useEffect(() => {
    updateGreeting();

    // Update every minute
    const timer = setInterval(updateGreeting, 60000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // LOAD TASKS FROM BACKEND
  // ==========================================

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Backend error");
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
  // CLICK / TOUCH ANIMATION
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

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  // ==========================================
  // TOGGLE TASK
  // ==========================================

  const toggleTask = async (id) => {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const updatedCompleted = !task.completed;

    setTasks((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, completed: updatedCompleted }
          : item
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
        throw new Error("Update failed");
      }

      const updatedTask = await response.json();

      setTasks((current) =>
        current.map((item) =>
          item.id === id ? updatedTask : item
        )
      );
    } catch (err) {
      console.error(err);

      setTasks((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, completed: task.completed }
            : item
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

    if (!newSubject.trim() || !newTime.trim()) {
      setError("Please enter subject and time.");
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
        throw new Error("Add task failed");
      }

      const newTask = await response.json();

      setTasks((current) => [...current, newTask]);

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

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setTasks((current) =>
        current.filter((item) => item.id !== id)
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

      {/* Animated background */}
      <div className="background-orb orb-one"></div>
      <div className="background-orb orb-two"></div>
      <div className="background-orb orb-three"></div>

      {/* HEADER */}
      <header className="header">

        <div className="logo">
          <div className="logo-icon">✦</div>

          <div>
            <h1>AI Study Planner</h1>
            <p>Smart learning. Better results.</p>
          </div>
        </div>

        <nav>
          <a href="#dashboard">Home</a>
          <a href="#tasks">Tasks</a>
          <a href="#progress">Progress</a>
        </nav>

        <div className="live-time">
          🕐 {currentTime}
        </div>

      </header>

      {/* MAIN */}
      <main className="container" id="dashboard">

        {/* HERO */}
        <section className="hero">

          <div className="hero-text">

            <div className="small-label">
              ✨ YOUR PERSONAL STUDY SPACE
            </div>

            <h2>
              {greeting}
              <span className="wave">👋</span>
            </h2>

            <h3>
              Let's make today
              <span> productive.</span>
            </h3>

            <p>
              Organize your study sessions, track your
              progress and stay focused on your goals.
            </p>

            <div className="hero-buttons">
              <a href="#tasks" className="primary-button">
                Start Studying →
              </a>

              <div className="status">
                <span className="status-dot"></span>
                Your planner is ready
              </div>
            </div>

          </div>

          {/* 3D STYLE VISUAL */}
          <div className="hero-visual">

            <div className="glow-circle"></div>

            <div className="floating-card card-one">
              📚
            </div>

            <div className="floating-card card-two">
              ✨
            </div>

            <div className="floating-card card-three">
              🎯
            </div>

            <div className="dashboard-cube">

              <div className="cube-top">
                <span>Today's Focus</span>
                <strong>{progress}%</strong>
              </div>

              <div className="cube-progress">
                <div
                  style={{
                    width: `${progress}%`,
                  }}
                ></div>
              </div>

              <div className="cube-bottom">
                <span>Completed</span>
                <strong>
                  {completedTasks}/{totalTasks}
                </strong>
              </div>

            </div>

          </div>

        </section>

        {/* ERROR */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* STATS */}
        <section className="stats" id="progress">

          <div className="stat-card">
            <div className="stat-icon purple">📚</div>

            <div>
              <p>Total Tasks</p>
              <h3>{totalTasks}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <p>Completed</p>
              <h3>{completedTasks}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pink">🎯</div>

            <div>
              <p>Progress</p>
              <h3>{progress}%</h3>
            </div>
          </div>

        </section>

        {/* ADD TASK */}
        <section className="task-section" id="tasks">

          <div className="section-heading">
            <div>
              <span>PLAN YOUR DAY</span>
              <h2>Add a New Task</h2>
            </div>

            <div className="sparkle">✦</div>
          </div>

          <form
            className="task-form"
            onSubmit={addTask}
          >

            <input
              type="text"
              placeholder="📖 Subject"
              value={newSubject}
              onChange={(event) =>
                setNewSubject(event.target.value)
              }
            />

            <input
              type="text"
              placeholder="⏰ Time e.g. 4:00 - 5:00"
              value={newTime}
              onChange={(event) =>
                setNewTime(event.target.value)
              }
            />

            <button type="submit">
              + Add Task
            </button>

          </form>

        </section>

        {/* TASK LIST */}
        <section className="tasks-section">

          <div className="section-heading">
            <div>
              <span>YOUR SCHEDULE</span>
              <h2>Today's Tasks</h2>
            </div>

            <span className="task-count">
              {totalTasks} tasks
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              Loading your tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>No tasks yet</h3>
              <p>
                Add your first study task above.
              </p>
            </div>
          ) : (
            <div className="task-list">

              {tasks.map((task) => (
                <div
                  className={`task-card ${
                    task.completed ? "completed" : ""
                  }`}
                  key={task.id}
                >

                  <button
                    className="check-button"
                    onClick={() =>
                      toggleTask(task.id)
                    }
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  <div className="task-info">

                    <h3>{task.subject}</h3>

                    <p>
                      ⏰ {task.time}
                    </p>

                  </div>

                  <div className="task-status">
                    {task.completed
                      ? "Completed"
                      : "In progress"}
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    ×
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

      </main>

      {/* FOOTER */}
      <footer>
        <p>
          ✦ AI Study Planner
        </p>

        <span>
          Study smarter. Stay consistent.
        </span>
      </footer>

    </div>
  );
}

export default App;