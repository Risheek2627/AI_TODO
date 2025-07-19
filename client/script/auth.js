const modal = document.getElementById("authModal");
const openBtn = document.getElementById("openAuthModal");
const toggleText = document.getElementById("toggleAuth");
const modalTitle = document.getElementById("modalTitle");
const authForm = document.getElementById("authForm");

let isLoginMode = true;
const API = "http://localhost:3000"; // Change if backend is on different port

// Open modal
openBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// Toggle between login and register
toggleText.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  modalTitle.textContent = isLoginMode ? "Login" : "Register";
  toggleText.textContent = isLoginMode
    ? "Don’t have an account? Register"
    : "Already have an account? Login";
});

// Submit form
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(
      `${API}/${isLoginMode ? "api/user/login" : "api/user/register"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Auth failed");
      return;
    }

    // Save token
    localStorage.setItem("token", data.token);
    alert("Login successful ✅");

    // Redirect to dashboard
    window.location.href = "home.html";
  } catch (err) {
    console.error("Auth error:", err);
    alert("Something went wrong!");
  }
});
