const Task = require("../model/Task");

const sendToGemini = require("../utils/gemini");

const analyzeInput = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `You are an AI task assistant . Extract task name and datetime from this sentence : 
    "${text}"
    Respond in JSON like : {"task" : "" , "datetime" : ""}`;

    const raw = await sendToGemini(promt);

    const json = JSON.parse(raw);

    return res.status(200).json({ task: json.task, datetime: json.datetime });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

const suggestPriority = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, completed: false });

    const prompt = `
You are a productivity assistant. Based on due dates and urgency, suggest which task the user should do first. Tasks:

${JSON.stringify(tasks)}

Respond with a friendly motivational suggestion.
`;

    const suggestion = await sendToGemini(prompt);
    res.status(200).json({ suggestion });
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

module.exports = { analyzeInput, suggestPriority, motivateUser };
