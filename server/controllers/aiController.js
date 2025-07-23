const { Error } = require("mongoose");
const Task = require("../model/Task");
// const { smartChat } = require("../utils/gemini");
const User = require("../model/User");
const { sendToGemini } = require("../utils/gemini");

const analyzeInput = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `You are an AI task assistant . Extract task name and datetime from this sentence : 
    "${text}"
    Respond in JSON like : {"task" : "" , "datetime" : ""}`;

    const raw = await sendToGemini(prompt);

    const json = JSON.parse(raw);

    return res.status(200).json({ task: json.task, datetime: json.datetime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// In controllers/aiController.js
const suggestPriority = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, completed: false });

    const prompt = `
You are a thoughtful productivity assistant. Analyze these tasks and suggest which to do first,
considering both deadlines AND emotional importance (health, family, emergencies).

TASKS:
${tasks
  .map(
    (t) => `- ${t.title} (Due: ${t.dueDate?.toDateString() || "No deadline"})`
  )
  .join("\n")}

Guidelines:
1. Health/family tasks get top priority (look for words like "mom", "hospital", "doctor")
2. If multiple urgent tasks, suggest the most time-sensitive
3. Include a caring reason
4. Respond in this JSON format:
{"suggestion": "Your empathetic suggestion", "reason": "Brief justification"}

Response Example:
{"suggestion": "Call your mom first", "reason": "Family health is more important than work deadlines"}
`;

    const { suggestion, reason } = await sendToGemini(prompt);
    res.status(200).json({ suggestion: `${suggestion} (Reason: ${reason})` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const motivateUser = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });

    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    const percent = ((completed / total) * 100).toFixed(1);

    const prompt = `
You're a motivational coach. The user has completed ${completed} out of ${total} tasks (${percent}%). Give a short motivational message.
`;

    const motivation = await sendToGemini(prompt);
    res.status(200).json({ motivation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// const handleAiChat = async (req, res) => {
//   try {
//     console.log("✅ Entered /ai/chat route"); // Add this line

//     const userId = req.userId;
//     const { message } = req.body;

//     const reply = await sendToGemini(message, userId);

//     if (reply.action === "add") {
//       await Task.create({
//         user: userId,
//         title: reply.title,
//         dueDate: reply.dueDate ? new Date(reply.dueDate) : null,
//         completed: false,
//       });
//     }

//     res.json({ success: true, response: reply });
//   } catch (err) {
//     console.error("🔥 AI Chat error:", err.message); // Already present
//     res.status(500).json({ message: err.message });
//   }
// };

// todo deepseek
const handleAiChat = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User ID", userId);
    const { message } = req.body;
    // const user = await User.findById(userId)
    // if(!user)
    let reply = await sendToGemini(message, userId);

    // Handle markdown-wrapped JSON responses if needed
    if (typeof reply === "string" || reply.action === "reply") {
      const jsonMatch = reply.message?.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          reply = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error("Failed to parse embedded JSON:", e);
        }
      }
    }

    if (reply.action === "add") {
      // Validate and parse the due date
      let parsedDueDate = null;
      if (reply.dueDate) {
        parsedDueDate = new Date(reply.dueDate);
        const now = new Date();

        if (parsedDueDate < now) {
          parsedDueDate.setFullYear(now.getFullYear());
          console.log("adjusted the time", parsedDueDate);
        }
        if (isNaN(parsedDueDate.getTime())) {
          console.log("Invalid date received:", reply.dueDate);
          parsedDueDate = null;
        }
      }

      await Task.create({
        user: userId,
        task: reply.title || "Untitled Task", // Add this if your model requires it
        dueDate: parsedDueDate,
        completed: false,
      });
    }

    res.json({ success: true, response: reply });
  } catch (err) {
    console.error("🔥 AI Chat error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { analyzeInput, suggestPriority, motivateUser, handleAiChat };
