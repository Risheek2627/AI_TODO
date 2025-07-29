const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

module.exports = async function extractText(file) {
  const buffer = file.buffer;
  const mimetype = file.mimetype;

  if (mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (mimetype.startsWith("text/")) {
    return buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type");
  }
};
