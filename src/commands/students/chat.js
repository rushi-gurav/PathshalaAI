const { queryOpenRouter } = require('../../utils/aiHelper');

module.exports = async (bot, msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `🧑‍🎓 Academic Chat Assistant Started!\n\n💬 You can start asking your *study-related* questions only.\n📌 Type *exit* anytime to stop.\n\nExample: "Explain Newton’s 2nd Law"`,
    { parse_mode: 'Markdown' }
  );

  const isStudyRelated = (text) => {
    const studyKeywords = [
      'physics', 'math', 'chemistry', 'biology', 'history',
      'geography', 'science', 'engineering', 'programming', 'code',
      'definition', 'explain', 'law', 'formula', 'study', 'exam',
      'education', 'chapter', 'topic', 'subject', 'syllabus',
    ];
    return studyKeywords.some((keyword) => text.toLowerCase().includes(keyword));
  };

  const startConversation = () => {
    bot.once('message', async (questionMsg) => {
      const chatId = questionMsg.chat.id;

      // ✅ Check for valid text message
      if (!questionMsg.text || typeof questionMsg.text !== 'string') {
        bot.sendMessage(chatId, '⚠️ Please send a valid text message.');
        return startConversation();
      }

      const question = questionMsg.text.trim();

      if (question.toLowerCase() === 'exit') {
        bot.sendMessage(chatId, '👋 Chat ended. You can start again anytime by typing /chat.');
        return;
      }

      if (!isStudyRelated(question)) {
        bot.sendMessage(chatId, '⚠️ Please ask study-related questions only.');
        return startConversation();
      }

      bot.sendChatAction(chatId, 'typing');
      bot.sendMessage(chatId, 'Thinking... 🧠');

      const prompt = `You are an educational assistant. Help answer the following student question in a simple and clear way:\n\n"${question}"`;

      try {
        const aiResponse = await queryOpenRouter(prompt);
        bot.sendMessage(chatId, `📘 Answer:\n\n${aiResponse}`);
      } catch (error) {
        console.error('❌ Error from OpenRouter:', error.message || error);
        bot.sendMessage(chatId, '❌ Sorry, I couldn’t generate a response. Try again.');
      }

      startConversation(); // 🔁 Listen for the next message
    });
  };

  startConversation();
};
