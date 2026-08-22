import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add task form
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  // ------------------------------------
  // Load tasks from backend
  // ------------------------------------
  useEffect(() => {
    const fetchTasks = async () => {
      try {
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

  // ------------------------------------
  // Toggle task completion
  // ------------------------------------
  const toggleTask = async (id) => {
    const task = tasks.find((task) => task.id === id);

    if (!task) return;

    const oldCompleted = task.completed;
    const updatedCompleted = !oldCompleted;

    // Update UI immediately
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: updatedCompleted }
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

      // Make frontend match backend
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      );
    } catch (err) {
      console.error(err);

      // Restore previous state
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id
            ? { ...task, completed: oldCompleted }
            : task
        )
      );

      setError("Could not save the task.");

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  // ------------------------------------
  // Add new task
  // ------------------------------------
  const addTask = async (event) => {
    event.preventDefault();

    if (!subject.trim() || !time.trim()) {
      setError("Please enter both subject and time.");
      return;
    }

    setAddingTask(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          time: time.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const newTask = await response.json();

      // Add new task to screen
      setTasks((currentTasks) => [...currentTasks, newTask]);

      // Clear form
      setSubject("");
      setTime("");
    } catch (err) {
      console.error(err);
      setError("Could not add the task.");
    } finally {
      setAddingTask(false);
    }
  };

  // ------------------------------------
  // Delete task
  // ------------------------------------
  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Remove from UI
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Could not delete the task.");

      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  // ------------------------------------
  // Statistics
  // ------------------------------------
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // ------------------------------------
  // UI
  // ------------------------------------
  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <h1>AI Study Planner</h1>

        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Tasks</a>
          <a href="#">Exams</a>
        </nav>
      </header>

      <main className="dashboard">

        {/* Welcome */}
        <section className="welcome">
          <h2>Good morning 👋</h2>
          <p>Let's make today productive.</p>
        </section>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px 16px",
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
            <h3>Today's Tasks</h3>
            <strong>{totalTasks}</strong>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>
            <strong>{completedTasks}</strong>
          </div>

          <div className="stat-card">
            <h3>Progress</h3>
            <strong>{progress}%</strong>
          </div>

        </section>

        {/* Study Plan */}
        <section className="study-plan">

          <h2>Today's Study Plan</h2>

          {/* ------------------------------------
              ADD TASK FORM
          ------------------------------------ */}
          <form
            onSubmit={addTask}
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "25px",
              padding: "20px",
              background: "#f8fafc",
              borderRadius: "12px",
            }}
          >
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                flex: "1",
                minWidth: "180px",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />

            <input
              type="text"
              placeholder="Time e.g. 4:00 - 5:00"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                flex: "1",
                minWidth: "180px",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />

            <button
              type="submit"
              disabled={addingTask}
              style={{
                padding: "12px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: addingTask ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              {addingTask ? "Adding..." : "+ Add Task"}
            </button>
          </form>

          {/* ------------------------------------
              TASK LIST
          ------------------------------------ */}
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No tasks available.</p>
          ) : (
            tasks.map((task) => (
              <div className="task" key={task.id}>

                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />

                <span
                  style={{
                    textDecoration: task.completed
                      ? "line-through"
                      : "none",
                    opacity: task.completed ? 0.5 : 1,
                  }}
                >
                  {task.subject}
                </span>

                <small>{task.time}</small>

                {/* Delete button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                  style={{
                    marginLeft: "15px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  🗑️
                </button>

              </div>
            ))
          )}

        </section>

        {/* Upcoming Exams */}
        <section className="exams">

          <h2>Upcoming Exams</h2>

          <div className="exam">
            <span>Data Structures</span>
            <strong>12 days</strong>
          </div>

          <div className="exam">
            <span>Database Systems</span>
            <strong>18 days</strong>
          </div>

        </section>

      </main>
    </div>
  );
}

export default App;