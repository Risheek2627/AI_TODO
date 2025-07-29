// // // https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

// const dotenv = require("dotenv");
// dotenv.config();
// const axios = require("axios");
// const Task = require("../model/Task");

// const API_KEY = process.env.GEMINI_API_KEY;

// exports.sendToGemini = async (message, userId) => {
//   try {
//     const tasks = await Task.find({ user: userId });
//     const taskList = tasks
//       .map(
//         (task, i) =>
//           `${i + 1}. ${task.task} (Due: ${
//             task.dueDate ? task.dueDate.toDateString() : "No date"
//           })`
//       )
//       .join("\n");
//     console.log("🧾 USER TASK LIST:\n", taskList);
//     const today = new Date().toISOString().split("T")[0]; // e.g., "2025-07-23"

//     const taskToday = new Date().toISOString();
//     const prompt = `
// 🧠 You are a smart AI productivity assistant with emotional intelligence. You help users manage their time, tasks, mood, and motivation — like ChatGPT, but focused on productivity.

// USER'S TASKS:
// ${taskList || "No tasks available"}

// USER INPUT:
// "${message}"

// TODAY'S DATE: ${today}

// TaskDate : ${taskToday}
// TASK DATABASE SCHEMA:

// Each task document has the following fields:

// {
//   _id: ObjectId,
//   user: ObjectId,         // ID of the user who owns the task
//   task: String,           // Title or description of the task
//   dueDate: Date,          //  due date and time
//   completed: Boolean,     // true if task is done
// }

// 🎯 Your job is to interpret what the user meant and respond with one of these structured JSON actions:

// ---

// 📌 ACTIONS YOU CAN RETURN:

// 1. ✅ NEW TASK (Add)
// If the user wants to add a task — or says anything like "I have to", "I want to", "remind me", "plan to", "I'll do", "going to do", "I like to do" etc., return:
// and so when you add the task give category also like if user task is based on study , read , write like that put in "Study" , if his taks are like "call"  "meetings" put it into "casual" thing ,  if his tasks are like  "gym" , "play" , "yoga" , "drink" like this put it into "health and fitness" category ,If the task contains words like "meeting", "report", "project" → category = "Work"
// If it contains "buy", "recharge", "groceries" → category = "Errands"

// {
//   "action": "add",
//   "title": "Task title here",
//   "dueDate": "Optional ISO format like 2025-07-15T15:00:00",
//   category : "Give category name based on which task it is"
// }

// 2. ✅ SUGGESTION (What should I do now?)
// If the user asks "what to do", "what now", "which task first", "help me prioritize", etc., return:
// {
//   "action": "suggest",
//   "suggestion": "Do this task",
//   "reason": "Reason why this is the most important"
// }

// 🎯 Prioritize health/family/emotional tasks even if scheduled later.

// 3. ✅ MOTIVATION
// If the user says "I feel tired", "I'm demotivated", "help me stay on track", "say something inspiring", etc. return:
// {
//   "action": "motivate",
//   "message": "Positive uplifting message based on progress or situation"
// }

// 4. ✅ CASUAL / FUN / EMOTIONAL CHAT
// If the user says "Tell me a joke", "Say something funny", "I'm bored", "Hello", "What's up", etc., return:
// {
//   "action": "reply",
//   "message": "A casual/funny/helpful reply, like a joke or greeting"
// }

// 5. ❓ UNCLEAR or UNKNOWN
// If you can’t understand clearly, return:
// {
//   "action": "reply",
//   "message": "Sorry, I didn’t understand. Could you rephrase?"
// }

// 6. Query (Natural language to Query)
// If  user says to list , search ,filter ,show the tasks based on criteria like keyword, due date, completed, like this return :
// {
//   "action": "query",
//   "filter": "Valid mongoDB query"
// }
// ---

// ⚠️ RULES TO FOLLOW:

// - Ignore completed tasks.
// - Use empathy: Health or family > Deadline > Everything else.
// - If a task says "Call mom", it is likely more important than "Study for exam" — unless there's a deadline in a few hours.
// - Do not ask follow-up questions — respond with a best guess.
// - Use only the defined action types above — don't invent new ones.
// - Return clean JSON only — no markdown, no explanations.
// - When you add the job then see the current year correctly.
// - Do NOT generate past dates. Always assume current year is 2025 or later when interpreting user input like "tomorrow", "next week", etc.

// ---

// 🧪 EXAMPLES:
// USER: "Show all my completed tasks"
// {
//   "action": "query",
//   "filter": {
//     "completed": true,
//     "user": "USER_ID"
//   }
// }

// USER : "Can you show overdue tasks"
// {
//   "action": "query",
//   "filter": {
//     {$lt : "TaskDate"} ,
//      "user" : USER_ID,
//     "completed": false,
// }

// USER: "Show all my due tasks tasks"
// {
//   "action": "query",
//   "filter": {
//     {$lt : "TaskDate"} ,
//     "user" : USER_ID,
//    "completed": false,
// }

// USER: "List tasks that are past due"
// {
//   "action": "query",
//   "filter": {
//     "dueDate": { "$lt": "TaskDate" },
//     "completed": false,
//     "user": "USER_ID"
//   }
// }

// USER: "Show all overdue items"
// {
//   "action": "query",
//   "filter": {
//     "dueDate": { "$lt": "TaskDate" },
//     "completed": false,
//     "user": "USER_ID"
//   }
// }

// USER: "List health tasks due after next Monday"
// {
//   "action": "query",
//   "filter": {
//     "dueDate": { "$gt": "TaskDate" },
//     "completed": false,
//     "user": "USER_ID"
//   }
// }

// USER: "Call mom she is sick"
// → {
//   "action": "add",
//   "title": "Call mom she is sick",
//   "dueDate": null,
//   "category" : "casual"
// }

// USER: "What should I do now?"
// → {
//   "action": "suggest",
//   "suggestion": "Call your mom",
//   "reason": "She is sick — health should come first"
// }

// USER: "Tell me a joke"
//  {
//   "action": "reply",
//   "message": "Why don’t skeletons fight? They don’t have the guts! 😄"
// }

// USER: "I'm tired, I feel like giving up..."
//  {
//   "action": "motivate",
//   "message": "You're doing great! Just one step at a time — progress is happening."
// }

// USER: "Add: Submit internship form by tomorrow 5pm"
// → {
//   "action": "add",
//   "title": "Submit internship form",
//   "dueDate": "2025-07-16T17:00:00"
// }
// `;

//     const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

//     const res = await axios.post(url, {
//       contents: [{ parts: [{ text: prompt }] }],
//     });

//     const replyText = res.data.candidates[0]?.content?.parts[0]?.text;
//     console.log(replyText);
//     try {
//       return JSON.parse(replyText);
//     } catch (e) {
//       return {
//         action: "reply",
//         message: replyText || "Couldn't understand your request clearly.",
//       };
//     }
//   } catch (error) {
//     console.error("Gemini API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

// // https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

// const dotenv = require("dotenv");
// dotenv.config();
// const axios = require("axios");
// const Task = require("../model/Task");

// const API_KEY = process.env.GEMINI_API_KEY;

// exports.sendToGemini = async (message, userId) => {
//   try {
//     const tasks = await Task.find({ user: userId });
//     const taskList = tasks
//       .map(
//         (task, i) =>
//           `${i + 1}. ${task.task} (Due: ${
//             task.dueDate ? task.dueDate.toDateString() : "No date"
//           })`
//       )
//       .join("\n");
//     console.log("🧾 USER TASK LIST:\n", taskList);
//     const now = new Date().toISOString(); // Use 'now' for precise current timestamp for comparisons

//     const prompt = `
// 🧠 You are a smart AI productivity assistant with emotional intelligence. You help users manage their time, tasks, mood, and motivation — like ChatGPT, but focused on productivity.

// USER'S TASKS:
// ${taskList || "No tasks available"}

// USER INPUT:
// "${message}"

// CURRENT_TIMESTAMP: "${now}"

// TASK DATABASE SCHEMA:

// Each task document has the following fields:

// {
//   _id: ObjectId,
//   user: ObjectId,         // ID of the user who owns the task
//   task: String,           // Title or description of the task
//   dueDate: Date,          // due date and time (stored as ISO Date in MongoDB)
//   completed: Boolean,     // true if task is done
// }

// 🎯 Your job is to interpret what the user meant and respond with one of these structured JSON actions:

// ---

// 📌 ACTIONS YOU CAN RETURN:

// 1. ✅ NEW TASK (Add)
// If the user wants to add a task — or says anything like "I have to", "I want to", "remind me", "plan to", "I'll do", "going to do", "I like to do" etc., return:
// and so when you add the task give category also like if user task is based on study , read , write like that put in "Study" , if his taks are like "call"  "meetings" put it into "casual" thing ,  if his tasks are like  "gym" , "play" , "yoga" , "drink" like this put it into "health and fitness" category ,If the task contains words like "meeting", "report", "project" → category = "Work"
// If it contains "buy", "recharge", "groceries" → category = "Errands"

// {
//   "action": "add",
//   "title": "Task title here",
//   "dueDate": "Optional ISO format like 2025-07-15T15:00:00",
//   "category" : "Give category name based on which task it is"
// }

// 2. ✅ SUGGESTION (What should I do now?)
// If the user asks "what to do", "what now", "which task first", "help me prioritize", etc., return:
// {
//   "action": "suggest",
//   "suggestion": "Do this task",
//   "reason": "Reason why this is the most important"
// }

// 🎯 Prioritize health/family/emotional tasks even if scheduled later.

// 3. ✅ MOTIVATION
// If the user says "I feel tired", "I'm demotivated", "help me stay on track", "say something inspiring", etc. return:
// {
//   "action": "motivate",
//   "message": "Positive uplifting message based on progress or situation"
// }

// 4. ✅ CASUAL / FUN / EMOTIONAL CHAT
// If the user says "Tell me a joke", "Say something funny", "I'm bored", "Hello", "What's up", etc., return:
// {
//   "action": "reply",
//   "message": "A casual/funny/helpful reply, like a joke or greeting"
// }

// 5. ❓ UNCLEAR or UNKNOWN
// If you can’t understand clearly, return:
// {
//   "action": "reply",
//   "message": "Sorry, I didn’t understand. Could you rephrase?"
// }

// 6. Query (Retrieve/Search/Filter Tasks)
// If the user explicitly asks to **list, search, find, show, or filter tasks** based on criteria like keywords, due dates, completion status, or other attributes, return:
// {
//   "action": "query",
//   "filter": "Valid mongoDB query object as a string, e.g., '{ \"completed\": false, \"dueDate\": { \"$lt\": \"CURRENT_TIMESTAMP\" } }'"
// }
// ---

// ⚠️ RULES TO FOLLOW:

// - The "user" field in the MongoDB query must always be included with the placeholder "USER_ID".
// - When generating a query, ensure all field names('task', 'dueDate', 'completed', 'user')exactly match the schema.
// - For date comparisons in MongoDB queries, use the "CURRENT_TIMESTAMP" placeholder for the current date. Do NOT hardcode dates.
// - Do NOT generate past dates for new tasks. Always assume current year is 2025 or later when interpreting user input like "tomorrow", "next week", etc.
// - Return clean JSON only — no markdown, no explanations, no backticks outside the "filter" string.

// ---

// 🧪 EXAMPLES:
// USER: "Show all my completed tasks"
// {
//   "action": "query",
//   "filter": "{ \"completed\": true, \"user\": \"USER_ID\" }"
// }

// USER: "Can you show overdue tasks"
// {
//   "action": "query",
//   "filter": "{ \"dueDate\": { \"$lt\": \"CURRENT_TIMESTAMP\" }, \"completed\": false, \"user\": \"USER_ID\" }"
// }

// USER: "Show all my due tasks"
// {
//   "action": "query",
//   "filter": "{ \"dueDate\": { \"$lte\": \"CURRENT_TIMESTAMP\" }, \"completed\": false, \"user\": \"USER_ID\" }"
// }

// USER: "List tasks that are past due"
// {
//   "action": "query",
//   "filter": "{ \"dueDate\": { \"$lt\": \"CURRENT_TIMESTAMP\" }, \"completed\": false, \"user\": \"USER_ID\" }"
// }

// USER: "Show all overdue items"
// {
//   "action": "query",
//   "filter": "{ \"dueDate\": { \"$lt\": \"CURRENT_TIMESTAMP\" }, \"completed\": false, \"user\": \"USER_ID\" }"
// }

// USER: "List health tasks due after next Monday"
// {
//   "action": "query",
//   "filter": "{ \"dueDate\": { \"$gt\": \"CURRENT_TIMESTAMP\" }, \"completed\": false, \"user\": \"USER_ID\", \"category\": \"health and fitness\" }"
// }

// USER: "Find tasks for work"
// {
//   "action": "query",
//   "filter": "{ \"category\": \"Work\", \"completed\": false, \"user\": \"USER_ID\" }"
// }

// USER: "Show me uncompleted tasks"
// {
//   "action": "query",
//   "filter": "{ \"completed\": false, \"user\": \"USER_ID\" }"
// }

// USER: "Call mom she is sick"
// {
//   "action": "add",
//   "title": "Call mom she is sick",
//   "dueDate": null,
//   "category" : "casual"
// }

// USER: "What should I do now?"
// {
//   "action": "suggest",
//   "suggestion": "Call your mom",
//   "reason": "She is sick — health should come first"
// }

// USER: "Tell me a joke"
// {
//   "action": "reply",
//   "message": "Why don’t skeletons fight? They don’t have the guts! 😄"
// }

// USER: "I'm tired, I feel like giving up..."
// {
//   "action": "motivate",
//   "message": "You're doing great! Just one step at a time — progress is happening."
// }

// USER: "Add: Submit internship form by tomorrow 5pm"
// {
//   "action": "add",
//   "title": "Submit internship form",
//   "dueDate": "2025-07-30T17:00:00"
// }
// `;

//     const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

//     // IMPORTANT: Replace placeholders before sending the prompt
//     const finalPrompt = prompt
//       .replace(/CURRENT_TIMESTAMP/g, now)
//       .replace(/USER_ID/g, userId);

//     const res = await axios.post(url, {
//       contents: [{ parts: [{ text: finalPrompt }] }],
//     });

//     let replyText = res.data.candidates[0]?.content?.parts[0]?.text;
//     console.log("Raw Gemini Reply:", replyText); // Log the raw reply for debugging

//     // FIX: Remove Markdown code block wrappers if they exist
//     if (replyText.startsWith("```json")) {
//       replyText = replyText.substring(7); // Remove '```json\n' (7 characters)
//     }
//     if (replyText.endsWith("```")) {
//       replyText = replyText.slice(0, -3); // Remove '```' (3 characters)
//     }
//     // Also trim any whitespace, especially newlines, around the JSON
//     replyText = replyText.trim();
//     console.log("Cleaned Gemini Reply:", replyText); // Log the cleaned reply

//     try {
//       return JSON.parse(replyText);
//     } catch (e) {
//       console.error(
//         "Error parsing Gemini reply after cleaning:",
//         e,
//         "Cleaned Reply text:",
//         replyText
//       );
//       return {
//         action: "reply",
//         message:
//           replyText ||
//           "Couldn't understand your request clearly. (Parsing error after cleaning)",
//       };
//     }
//   } catch (error) {
//     console.error("Gemini API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const Task = require("../model/Task");

const API_KEY = process.env.GEMINI_API_KEY;

exports.sendToGemini = async (message, userId) => {
  try {
    const tasks = await Task.find({ user: userId });
    const taskList = tasks
      .map(
        (task, i) =>
          `${i + 1}. ${task.task} (Due: ${
            task.dueDate ? task.dueDate.toDateString() : "No date"
          })`
      )
      .join("\n");

    const now = new Date().toISOString(); // ISO string for current time
    console.log("🧾 USER TASK LIST:\n", taskList);

    // ✅ Construct Gemini prompt with correct rules
    const prompt = `🧠 You are a smart AI productivity assistant with emotional intelligence. You help users manage their time, tasks, mood, and motivation — like ChatGPT, but focused on productivity.

USER'S TASKS:
${taskList || "No tasks available"}

USER INPUT:
"${message}"

CURRENT_TIMESTAMP: "${now}"

TASK DATABASE SCHEMA:
{
  _id: ObjectId,
  user: ObjectId,
  task: String,
  dueDate: Date,
  completed: Boolean
}

🎯 Respond with one of these JSON actions only:

1. ✅ Add Task
{
  "action": "add",
  "title": "Task title",
  "dueDate": "2025-07-28T17:00:00",
  "category": "Study | Casual | Work | Health and Fitness | Errands"
}

2. ✅ Suggest What To Do
{
  "action": "suggest",
  "suggestion": "Task name",
  "reason": "Why it's important now"
}

3. ✅ Motivation
{
  "action": "motivate",
  "message": "Stay strong! You're doing great."
}

4. ✅ Casual Chat
{
  "action": "reply",
  "message": "Something funny, friendly or chill"
}

5. ✅ Query (Must return REAL object, not string!)
{
  "action": "query",
  "filter": {
    "dueDate": { "$lt": "CURRENT_TIMESTAMP" },
    "completed": false,
    "user": "USER_ID"
  }
}

6. ❓ Unknown
{
  "action": "reply",
  "message": "Sorry, I didn’t understand. Can you rephrase?"
}

⚠️ IMPORTANT RULES:
- DO NOT return "filter" as a string. Always real JSON object.
- Replace placeholders CURRENT_TIMESTAMP and USER_ID.
- No markdown. No backticks. Clean JSON only.
- Prioritize emotional/family tasks over deadlines

🧪 Example for overdue tasks:
{
  "action": "query",
  "filter": {
    "dueDate": { "$lt": "CURRENT_TIMESTAMP" },
    "completed": false,
    "user": "USER_ID"
  }
}
`;

    const finalPrompt = prompt
      .replace(/CURRENT_TIMESTAMP/g, now)
      .replace(/USER_ID/g, userId);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: finalPrompt }] }],
    });

    let replyText = res.data.candidates[0]?.content?.parts[0]?.text;
    console.log("Raw Gemini Reply:", replyText);

    // ✅ Clean ```json ... ``` if wrapped
    if (replyText.startsWith("```json")) {
      replyText = replyText.slice(7);
    }
    if (replyText.endsWith("```")) {
      replyText = replyText.slice(0, -3);
    }
    replyText = replyText.trim();
    console.log("Cleaned Gemini Reply:", replyText);

    try {
      let parsed = JSON.parse(replyText);

      console.log("Parsed Text : ", parsed);

      // ✅ Fix: Convert stringified "filter" field if needed
      if (parsed.action === "query" && typeof parsed.filter === "string") {
        parsed.filter = JSON.parse(parsed.filter);
      }

      return parsed;
    } catch (e) {
      console.error("❌ JSON Parse Error:", e, "\nReply Text:", replyText);
      return {
        action: "reply",
        message:
          "Sorry, I couldn't understand the response properly. (Parse error)",
      };
    }
  } catch (error) {
    console.error(
      "🚨 Gemini API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Draft_PO802S/2025/264239
