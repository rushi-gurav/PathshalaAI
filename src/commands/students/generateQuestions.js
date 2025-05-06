const { extractTextFromFile } = require('../../utils/pdfHelper');
const { queryOpenRouter } = require('../../utils/aiHelper');

module.exports = async (bot, msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, '📄 Please upload a PDF or TXT file from which you want to generate questions.');

  // Wait for a document upload
  bot.once('document', async (docMsg) => {
    try {
      const fileId = docMsg.document.file_id;
      const mimeType = docMsg.document.mime_type;

      // Extract text using helper
      const extractedText = await extractTextFromFile(bot, fileId, mimeType);
      if (!extractedText) {
        return bot.sendMessage(chatId, '❌ Failed to extract text from file.');
      }

      // Ask number of questions
      bot.sendMessage(chatId, '📋 How many questions do you want to generate? (e.g., 5, 10, 20)');

      bot.once('message', async (countMsg) => {
        try {
          const count = parseInt(countMsg.text.trim());

          if (isNaN(count) || count <= 0) {
            return bot.sendMessage(chatId, '❌ Invalid number. Please enter a valid count.');
          }

          bot.sendChatAction(chatId, 'typing');
          bot.sendMessage(chatId, '🧠 Generating your question bank... Please wait!');

          const prompt = `
You are a question paper generator assistant.

Based on the following study material, generate ${count} important questions suitable for exams. 
Include a mix of short and long answer types. 
Make sure questions are clear and challenging.

Study Material:
${extractedText}
`;

          const aiResponse = await queryOpenRouter(prompt);

          // Function to send large responses in chunks
          const sendMessageInChunks = (message) => {
            const chunkSize = 4096;  // Max message length allowed by Telegram
            const messageChunks = message.match(new RegExp('.{1,' + chunkSize + '}', 'g'));

            messageChunks.forEach((chunk) => {
              bot.sendMessage(chatId, chunk);
            });
          };

          // Send AI-generated response in chunks if it's too long
          sendMessageInChunks(`📚 Here’s your Question Bank:\n\n${aiResponse}`);
          
        } catch (error) {
          console.error('❌ Error during question generation:', error.message);
          bot.sendMessage(chatId, '❌ Failed to generate questions. Please try again.');
        }
      });

    } catch (error) {
      console.error('❌ Error handling uploaded document:', error.message);
      bot.sendMessage(chatId, '❌ Could not process the uploaded file.');
    }
  });
};
