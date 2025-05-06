const pdfParse = require('pdf-parse');
const { queryOpenRouter } = require('./aiHelper');

/**
 * Analyze multiple past question papers to find frequently asked questions.
 * @param {Buffer[]} pdfBuffers - An array of PDF buffers.
 * @returns {Promise<string>} - AI-generated frequently asked questions.
 */
async function analyzeFrequentQuestions(pdfBuffers) {
  try {
    let allText = '';

    for (const buffer of pdfBuffers) {
      const parsed = await pdfParse(buffer);
      allText += parsed.text + '\n\n';
    }

    const prompt = `
You are an exam paper analyst assistant.

Analyze the following past university question papers and extract the most frequently asked or repeated questions over the years.

✅ Return only the list of questions, no answers.
✅ Highlight recurring topics or patterns.
✅ Ensure the output is clean, concise, and exam-relevant.

Here is the combined text from past papers:
${allText}
`;

    const result = await queryOpenRouter(prompt);
    return result;
  } catch (err) {
    console.error('❌ PDF Analysis Error:', err.message);
    return '❌ Failed to analyze the PDFs. Please try again.';
  }
}

module.exports = { analyzeFrequentQuestions };
