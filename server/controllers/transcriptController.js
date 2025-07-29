// const extractText = require("../utils/extractTextFromFile");
// const axios = require("axios");
// const dotenv = require("dotenv");
// dotenv.config();
// const User = require("../model/User");
// const API_KEY = process.env.GEMINI_API_KEY_2;

// exports.askFromTranscript = async (req, res) => {
//   try {
//     const file = req.file;
//     const question = req.body.question || req.body["question "];
//     const userId = req.user.id;
//     const user = await User.findById(userId);
//     const userName = user.name;
//     console.log("User Name : ", userName);
//     // console.log("File : ", req.file);
//     // console.log("Question : ", req.body);

//     if (!file || !question) {
//       return res.status(400).json({ error: "File and question required" });
//     }

//     const text = await extractText(file);
//     // console.log("📄 Extracted Text:", text.slice(0, 300), "...");

//     const prompt = `You are an intelligent transcript analysis assistant.
// Below is a meeting transcript or task discussion.
// USER QUESTION: "${question}"

// TRANSCRIPT:
// ${text.slice(0, 8000)}

// MY : ${userName}
// Answer clearly and only based on the transcript.
// If the question contains "I", "me", or "my", interpret it as referring to "${userName}".

// If users asks about his tasks give the answers in bullet points .

// Example :
//  1. Completed Backend code.
//  2. Check the error logs.
//  3. Do the authentication for login`;

//     const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
//     const geminiRes = await axios.post(url, {
//       contents: [{ parts: [{ text: prompt }] }],
//     });

//     const answer = geminiRes.data.candidates[0]?.content?.parts[0]?.text;
//     console.log(answer);
//     res.json({ answer: answer.trim() });
//   } catch (err) {
//     console.error("❌ Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// todo Gemini
// const extractText = require("../utils/extractTextFromFile"); // Assuming this extracts full text
// const axios = require("axios");
// const dotenv = require("dotenv");
// dotenv.config();
// const User = require("../model/User"); // Assuming User model is correct

// // --- New Imports for Chunking/Embedding (Install these, e.g., via npm install @google/generative-ai) ---
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter"); // Or similar text splitting library

// // --- Configuration ---
// const API_KEY = process.env.GEMINI_API_KEY_2;
// const genAI = new GoogleGenerativeAI(API_KEY);
// const EMBEDDING_MODEL_NAME = "embedding-001"; // Or a more advanced embedding model if available
// const GENERATION_MODEL_NAME = "gemini-1.5-flash-latest"; // Or gemini-1.5-pro-latest for better reasoning
// const MAX_TRANSCRIPT_CHUNK_SIZE = 2000; // Tokens/characters per chunk for embedding
// const CHUNK_OVERLAP = 200; // Overlap between chunks for context
// const NUM_RETRIEVED_CHUNKS = 5; // How many top relevant chunks to send to the LLM

// // --- Simulated Vector Store (In-memory for demonstration) ---
// // In a real application, you'd use a dedicated vector database service/library.
// let transcriptChunks = []; // Stores objects like { text: "...", embedding: [...] }

// // Function to generate embeddings (Moved outside the handler for reusability)
// // Function to generate embeddings (Moved outside the handler for reusability)
// // CORRECTED embedding generation function
// async function generateEmbedding(text) {
//   try {
//     const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });

//     // PROPER payload structure for embedding-001 model
//     const result = await model.embedContent({
//       content: {
//         parts: [{ text: text }],
//         role: "user", // Adding role helps with some models
//       },
//       taskType: "RETRIEVAL_DOCUMENT", // Important for document embeddings
//     });

//     return result.embedding.values;
//   } catch (error) {
//     console.error("Detailed embedding error:", {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data,
//     });
//     throw new Error(`Failed to generate embedding: ${error.message}`);
//   }
// }

// // Function to chunk and embed transcript (Call this once per file upload)
// async function processTranscriptForSearch(fullText) {
//   const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: MAX_TRANSCRIPT_CHUNK_SIZE,
//     chunkOverlap: CHUNK_OVERLAP,
//   });

//   const docs = await textSplitter.createDocuments([fullText]);
//   const chunksWithEmbeddings = [];

//   console.log(`Splitting transcript into ${docs.length} chunks...`);

//   for (const doc of docs) {
//     try {
//       const embedding = await generateEmbedding(doc.pageContent);
//       chunksWithEmbeddings.push({
//         text: doc.pageContent,
//         embedding: embedding,
//       });
//     } catch (error) {
//       console.error("Error processing chunk for embedding:", error);
//       // Decide how to handle this: skip chunk, retry, or fail whole process
//     }
//   }
//   transcriptChunks = chunksWithEmbeddings; // Store globally or associate with user/file ID
//   console.log("Transcript chunks and embeddings generated.");
//   return transcriptChunks;
// }

// // Function to find top K similar chunks (Simulated vector search)
// function findTopKSemanticallySimilarChunks(queryEmbedding, k) {
//   if (transcriptChunks.length === 0) {
//     return [];
//   }

//   const similarities = transcriptChunks.map((chunk, index) => {
//     // Calculate cosine similarity (simple dot product for normalized vectors)
//     let dotProduct = 0;
//     for (let i = 0; i < queryEmbedding.length; i++) {
//       dotProduct += queryEmbedding[i] * chunk.embedding[i];
//     }
//     // Assuming embeddings are already normalized; if not, you'd divide by magnitudes
//     return { index, similarity: dotProduct };
//   });

//   similarities.sort((a, b) => b.similarity - a.similarity); // Sort by highest similarity
//   return similarities.slice(0, k).map((s) => transcriptChunks[s.index].text);
// }

// exports.askFromTranscript = async (req, res) => {
//   try {
//     const file = req.file; // This comes from a new file upload
//     const question = req.body.question?.trim() || req.body["question "]?.trim();
//     const userId = req.user.id;
//     const user = await User.findById(userId);
//     const userName = user.name;
//     console.log("User Name : ", userName);

//     if (!file || !question) {
//       return res.status(400).json({ error: "File and question required" });
//     }

//     // --- Step 1: Extract Full Text ---
//     const fullTranscriptText = await extractText(file);
//     // console.log("📄 Extracted Full Text Length:", fullTranscriptText.length);

//     // --- Step 2: Process Transcript (Chunking & Embedding) ---
//     // In a real app, you'd only do this *once* per file upload
//     // and store `transcriptChunks` associated with the file/user ID permanently.
//     // For demonstration, we re-process every time a question is asked with a new file.
//     const processedChunks = await processTranscriptForSearch(
//       fullTranscriptText
//     );
//     if (processedChunks.length === 0) {
//       return res
//         .status(500)
//         .json({ error: "Failed to process transcript for search." });
//     }

//     // --- Step 3: Generate Embedding for the User's Question ---
//     const questionEmbedding = await generateEmbedding(question);
//     if (!questionEmbedding) {
//       return res
//         .status(500)
//         .json({ error: "Failed to generate embedding for the question." });
//     }

//     // --- Step 4: Retrieve Most Relevant Chunks ---
//     const relevantChunks = findTopKSemanticallySimilarChunks(
//       questionEmbedding,
//       NUM_RETRIEVED_CHUNKS
//     );
//     if (relevantChunks.length === 0) {
//       return res.status(404).json({
//         answer:
//           "I couldn't find relevant information in the transcript to answer your question. The transcript might not contain the necessary context.",
//       });
//     }

//     // --- Step 5: Construct the Enhanced Prompt ---
//     // Combine relevant chunks into a single context string for the LLM
//     const contextForLLM = relevantChunks.join("\n\n---\n\n"); // Separator for clarity

//     const model = genAI.getGenerativeModel({ model: GENERATION_MODEL_NAME });

//     const prompt = `You are an intelligent, helpful, and highly accurate AI assistant specialized in analyzing meeting transcripts.
// Your goal is to answer user questions concisely and precisely, *strictly* using the information provided in the "TRANSCRIPT CONTEXT" section.

// **GUIDELINES:**
// 1.  **Strictly use provided context:** If the answer is not explicitly stated or inferable from the "TRANSCRIPT CONTEXT", state clearly: "The transcript does not contain information to answer that question." Do not make up information.
// 2.  **Handle "Clumsy" Questions:** Interpret informal, vague, or grammatically incorrect questions to understand the user's intent.
// 3.  **Persona Reference:** If the question contains "I", "me", or "my", interpret it as referring to "${userName}".
// 4.  **Task Lists:** If the user asks about tasks for a specific person (especially "${userName}"), provide the answer in bullet points, as demonstrated in the example.
// 5.  **Conciseness:** Be direct and to the point. Avoid conversational filler.
// 6.  **Quotation (Optional but good for verification):** You may occasionally quote directly from the transcript if it helps provide a precise answer, but only if necessary.

// ---
// **USER QUESTION:** "${question}"

// ---
// **TRANSCRIPT CONTEXT:**
// ${contextForLLM}

// ---
// **USER IDENTITY:** My name is ${userName}.

// ---
// **Example for Task Questions:**
// If the question is "What are my tasks?" and my name is "Rohan", a good answer format would be:
// - Schedule a quick huddle with Rishik and Priya for SSO prioritization.
// - Escalate recruitment issues to HR/leadership.
// - Review one-pagers from leads on vacancy impact.

// ---
// **ANSWER:**`;

//     // --- Step 6: Call Gemini API ---
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const answer = response.text();

//     console.log("✅ Answer generated:", answer);
//     res.json({ answer: answer.trim() });
//   } catch (err) {
//     console.error("❌ Error in askFromTranscript:", err);
//     // Differentiate between user-facing errors and internal errors
//     if (err.response && err.response.data && err.response.data.error) {
//       return res.status(err.response.status).json({
//         error: `Gemini API Error: ${err.response.data.error.message}`,
//       });
//     }
//     res.status(500).json({
//       error: "An internal server error occurred while processing your request.",
//     });
//   }
// };

// File: server/controllers/transcriptController.js

const fs = require("fs");
const path = require("path");
const extractText = require("../utils/extractTextFromFile");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../model/User");

// Configuration Constants
const CONFIG = {
  EMBEDDING_MODEL: "embedding-001",
  GENERATION_MODEL: "gemini-1.5-flash-latest",
  CHUNK_SIZE: 2000,
  CHUNK_OVERLAP: 200,
  RETRIEVAL_LIMIT: 5,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  BATCH_SIZE: 5,
  API_VERSION: "v1beta",
};

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2, {
  apiVersion: CONFIG.API_VERSION,
});

// In-memory store for transcript chunks (replace with DB in production)
let transcriptChunks = [];

/**
 * Validates text before embedding generation
 * @param {string} text - Input text to validate
 * @throws {Error} If text is invalid
 */
function validateTextForEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text input for embedding");
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error("Empty text after trimming");
  }

  if (trimmed.length > 20000) {
    throw new Error("Text exceeds maximum length of 20000 characters");
  }

  return trimmed;
}

/**
 * Generates embeddings with retry logic
 * @param {string} text - Text to embed
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Array<number>>} Embedding vector
 * @throws {Error} If embedding fails after retries
 */
async function generateEmbeddingWithRetry(text, retries = CONFIG.MAX_RETRIES) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: CONFIG.EMBEDDING_MODEL });
      const cleanText = validateTextForEmbedding(text);

      const result = await model.embedContent({
        content: {
          parts: [{ text: cleanText }],
          role: "user",
        },
        taskType: "RETRIEVAL_DOCUMENT",
      });

      return result.embedding.values;
    } catch (error) {
      lastError = error;

      if (error.status === 429) {
        // Rate limited
        const delay = attempt * CONFIG.RETRY_DELAY_MS;
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  throw lastError || new Error("Embedding generation failed");
}

/**
 * Processes transcript text into searchable chunks with embeddings
 * @param {string} fullText - Complete transcript text
 * @returns {Promise<Array<{text: string, embedding: Array<number>}>>} Processed chunks
 */
async function processTranscriptForSearch(fullText) {
  console.time("processTranscript");

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CONFIG.CHUNK_SIZE,
    chunkOverlap: CONFIG.CHUNK_OVERLAP,
  });

  const docs = await textSplitter.createDocuments([fullText]);
  const chunksWithEmbeddings = [];
  let processedCount = 0;

  console.log(`Processing ${docs.length} chunks...`);

  try {
    for (let i = 0; i < docs.length; i += CONFIG.BATCH_SIZE) {
      const batch = docs.slice(i, i + CONFIG.BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (doc) => {
          try {
            const result = {
              text: doc.pageContent,
              embedding: await generateEmbeddingWithRetry(doc.pageContent),
            };
            processedCount++;
            return result;
          } catch (error) {
            console.error(`Failed to process chunk ${i}:`, error.message);
            return null;
          }
        })
      );

      chunksWithEmbeddings.push(...batchResults.filter(Boolean));

      // Rate limiting between batches
      if (i + CONFIG.BATCH_SIZE < docs.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (chunksWithEmbeddings.length === 0) {
      throw new Error("No valid embeddings generated");
    }

    console.timeEnd("processTranscript");
    console.log(
      `Successfully processed ${processedCount}/${docs.length} chunks`
    );

    return chunksWithEmbeddings;
  } catch (error) {
    console.timeEnd("processTranscript");
    throw error;
  }
}

/**
 * Finds top K semantically similar chunks to a query embedding
 * @param {Array<number>} queryEmbedding - Embedding vector of the query
 * @param {number} k - Number of chunks to retrieve
 * @returns {Array<string>} Top matching chunk texts
 */
function findTopKSemanticallySimilarChunks(
  queryEmbedding,
  k = CONFIG.RETRIEVAL_LIMIT
) {
  if (!transcriptChunks.length) return [];

  return transcriptChunks
    .map((chunk) => ({
      text: chunk.text,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k)
    .map((item) => item.text);
}

/**
 * Calculates cosine similarity between two vectors
 * @param {Array<number>} vecA - First vector
 * @param {Array<number>} vecB - Second vector
 * @returns {number} Similarity score
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  return magA && magB ? dotProduct / (magA * magB) : 0;
}

/**
 * Generates a prompt for the LLM based on context and question
 * @param {string} question - User's question
 * @param {string} context - Retrieved context chunks
 * @param {string} userName - Current user's name
 * @returns {string} Formatted prompt
 */
function buildGenerationPrompt(question, context, userName) {
  return `You are an expert meeting transcript analyst. Answer the user's question strictly using the provided context.

**Guidelines:**
1. Base answers ONLY on the transcript context below
2. If unsure, say "The transcript doesn't contain information to answer that"
3. For "${userName}"'s tasks, provide bullet points
4. Be concise and accurate

**User Question:** ${question}

**Transcript Context:**
${context}

**Answer:**`;
}

/**
 * Main controller for transcript Q&A
 */
exports.askFromTranscript = async (req, res) => {
  try {
    // Validate input
    const file = req.file;
    const question = req.body.question?.trim() || req.body["question "]?.trim();

    const userId = req.user.id;

    if (!file || !question) {
      return res.status(400).json({
        error: "Both file and question are required",
        details: {
          received: {
            file: !!file,
            question: !!question,
          },
        },
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Process transcript
    const fullText = await extractText(file);
    transcriptChunks = await processTranscriptForSearch(fullText);

    // Generate question embedding
    const questionEmbedding = await generateEmbeddingWithRetry(question);
    const relevantChunks = findTopKSemanticallySimilarChunks(questionEmbedding);

    if (!relevantChunks.length) {
      return res.status(404).json({
        answer:
          "No relevant information found in the transcript to answer your question.",
      });
    }

    // Generate answer
    const model = genAI.getGenerativeModel({ model: CONFIG.GENERATION_MODEL });
    const prompt = buildGenerationPrompt(
      question,
      relevantChunks.join("\n\n---\n\n"),
      user.name
    );

    const result = await model.generateContent(prompt);
    const answer = (await result.response).text();

    // Return successful response
    res.json({
      answer: answer.trim(),
      metadata: {
        chunksAnalyzed: transcriptChunks.length,
        chunksReturned: relevantChunks.length,
      },
    });
  } catch (error) {
    console.error("Controller error:", error);

    const statusCode = error.status || 500;
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      "Internal server error";

    res.status(statusCode).json({
      error: errorMessage,
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
      }),
    });
  }
};
