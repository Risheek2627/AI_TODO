// const { sendToGemini } = require("../utils/gemini");
// const Task = require("../model/Task");

// const nlp = async (req, res) => {
//   try {
//     const message = req.body;
//     const userId = req.user.id;

//     const result = await sendToGemini(message, userId);

//     if (result.action === "query" && result.filter) {
//       const filter = { ...parsed.filter };
//       filter.user = userId;

//       const tasks = await Task.find(filter);

//       return res.json({
//         success: true,
//         action: "query",
//         result: tasks,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = nlp;

const { sendToGemini } = require("../utils/gemini");
const Task = require("../model/Task");

const nlp = async (req, res) => {
  try {
    // 1. Ensure you're sending the actual message string to Gemini
    // Assuming the user's message is in req.body.message
    const userMessage = req.body.message;
    const userId = req.user.id;

    // Call sendToGemini with the actual user message and ID
    const geminiResponse = await sendToGemini(userMessage, userId);

    // geminiResponse is already a parsed JSON object from sendToGemini

    if (geminiResponse.action === "query" && geminiResponse.filter) {
      // 2. Parse the filter string coming from Gemini into a JavaScript object
      let mongoFilter;
      try {
        mongoFilter = geminiResponse.filter;
      } catch (parseError) {
        console.error(
          "Error parsing MongoDB filter string from AI:",
          parseError
        );
        return res.status(400).json({
          success: false,
          message: "AI generated an invalid MongoDB query filter.",
        });
      }

      // The USER_ID placeholder should have been replaced in gemini.js,
      // but this line ensures the user field is always correct and present.
      mongoFilter.user = userId;

      const tasks = await Task.find(mongoFilter);

      return res.json({
        success: true,
        action: "query",
        result: tasks.map((task) => task.task),
        query: mongoFilter,
      });
    } else if (geminiResponse.action === "add") {
      // Handle 'add' action
      const newTask = new Task({
        user: userId,
        task: geminiResponse.title,
        dueDate: geminiResponse.dueDate
          ? new Date(geminiResponse.dueDate)
          : null,
        completed: false,
      });
      await newTask.save();
      return res.status(201).json({
        success: true,
        action: "add",
        message: `Task "${newTask.task}" added successfully!`,
        newTask: newTask,
      });
    } else {
      // Handle other actions (suggest, motivate, reply, unclear)
      return res.json({
        success: true,
        action: geminiResponse.action,
        message:
          geminiResponse.message ||
          geminiResponse.suggestion ||
          "Processing your request...",
        // You can add other relevant fields from geminiResponse here
      });
    }
  } catch (error) {
    console.error("NLP Backend Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
};

module.exports = nlp;
