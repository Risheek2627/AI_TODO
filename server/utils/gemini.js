const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const sendToGemini = async (prompt) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
            role: "user",
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    return result || "Sorry , no response from AI";
  } catch (error) {
    console.log(error);
    throw new Error("AI request failed");
  }
};

module.exports = sendToGemini;
