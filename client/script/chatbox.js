const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const chatBox = document.getElementById("chatBox");

const token = localStorage.getItem("token");
const API = "http://localhost:5000";

// Voice Recognition Setup
const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognizer = recognition ? new recognition() : null;

if (recognizer) {
  recognizer.lang = "en-IN";
  recognizer.continuous = false;

  voiceBtn.addEventListener("click", () => {
    recognizer.start();
  });

  recognizer.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    chatInput.value = spokenText;
    handleUserQuery(spokenText);
  };
} else {
  voiceBtn.disabled = true;
  voiceBtn.innerText = "❌";
  alert("Voice input not supported in this browser.");
}

// Text send
sendBtn.addEventListener("click", () => {
  const input = chatInput.value.trim();
  if (input) {
    handleUserQuery(input);
    chatInput.value = "";
  }
});

// Handles user query → AI response
async function handleUserQuery(message) {
  renderChat("user", message);

  try {
    const res = await fetch(`${API}/ai/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    const reply =
      data.reply || data.message || "⚠️ AI couldn't understand your request.";

    renderChat("ai", reply);
  } catch (err) {
    renderChat("ai", "⚠️ Server error. Try again later.");
  }
}

// Chat renderer
function renderChat(sender, message) {
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", sender === "user" ? "user" : "ai");
  bubble.textContent = message;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}
