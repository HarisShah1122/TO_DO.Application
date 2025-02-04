import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    console.log("Fetching tasks...");
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/tasks");
      console.log("Tasks fetched:", response.data.tasks);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      alert("Task cannot be empty!");
      return;
    }
  
    const taskObject = {
      text: newTask.trim(),
      date: new Date().toISOString().split("T")[0],  
      completed: false,
      status: "active",
    };
  
    try {
      const response = await axios.post("http://localhost:3000/new-task", taskObject, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.status === 201) {
        setTasks([...tasks, response.data.task]);
        setNewTask("");
      }
    } catch (error) {
      console.error("Error adding task:", error.response?.data || error.message);
    }
  };
  
  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/delete-task/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="home-container">
      <h1>To-Do App</h1>
      <div className="task-input">
        <input
          type="text"
          value={newTask}
          placeholder="Enter a task"
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <div className="task-filters">
        <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>
          All
        </button>
        <button onClick={() => setFilter("active")} className={filter === "active" ? "active" : ""}>
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={filter === "completed" ? "active" : ""}
        >
          Completed
        </button>
      </div>
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className={task.completed ? "completed" : ""}>
            <div className="task-content">
              <div className="task-details">
                <strong
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                >
                  {task.text}
                </strong>
                <span>Date: {task.date}</span>
                <span>Status: {task.completed ? "Completed" : "Active"}</span>
              </div>
              <div className="task-actions">
                <button
                  onClick={() =>
                    setTasks(
                      tasks.map((t) =>
                        t.id === task.id
                          ? { ...t, text: prompt("Edit task:", t.text) || t.text }
                          : t
                      )
                    )
                  }
                >
                  Edit
                </button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
                <button onClick={() => toggleComplete(task.id)}>
                  {task.completed ? "Undo" : "Complete"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;