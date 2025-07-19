const API = "http://localhost:5000"; // Adjust if needed
const token = localStorage.getItem("token");

// If no token, force back to login
if (!token) {
  alert("Please log in first.");
  window.location.href = "index.html";
}

// Load all tasks on page load
window.addEventListener("DOMContentLoaded", () => {
  loadTasks();

  // Add task
  document.getElementById("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value;
    const dueDate = document.getElementById("taskDueDate").value;

    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, dueDate }),
    });

    e.target.reset();
    loadTasks();
  });
});

// Load and render tasks
async function loadTasks() {
  const res = await fetch(`${API}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const tasks = await res.json();
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="${task.completed ? "completed" : ""}">
        ${task.title} - ${new Date(task.dueDate).toLocaleString()}
      </span>
      <button onclick="toggleComplete('${task._id}', ${
      task.completed
    })">✅</button>
      <button onclick="deleteTask('${task._id}')">🗑️</button>
    `;

    taskList.appendChild(li);
  });
}

// Toggle complete
async function toggleComplete(id, current) {
  await fetch(`${API}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ completed: !current }),
  });

  loadTasks();
}

// Delete task
async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  loadTasks();
}
