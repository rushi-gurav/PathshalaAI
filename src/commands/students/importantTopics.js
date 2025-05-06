const pdfParse = require('pdf-parse');
const { queryOpenRouter } = require('../../utils/aiHelper');

module.exports = (bot, msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      keyboard: [['📄 Upload PDF', '📘 Type Subject']],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  bot.sendMessage(chatId, 'How would you like to find important topics?', options);

  bot.once('message', (modeMsg) => {
    const choice = modeMsg.text;

    if (choice === '📄 Upload PDF') {
      bot.sendMessage(chatId, 'Please upload your PDF now.');

      bot.once('document', async (docMsg) => {
        const fileId = docMsg.document.file_id;

        try {
          const file = await bot.getFile(fileId);
          const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
          const response = await fetch(fileUrl);
          const buffer = await response.arrayBuffer();

          const data = await pdfParse(Buffer.from(buffer));
          const text = data.text.slice(0, 2000);

          bot.sendMessage(chatId, '📚 Extracting important topics from PDF...');

          const prompt = `
            You are an expert professor.
            Based on the following text, extract the **most important topics** that students should focus on.

            Content:
            ${text}
          `;

          const aiResponse = await queryOpenRouter(prompt);
          bot.sendMessage(chatId, `🔖 Important Topics:\n\n${aiResponse}`);
        } catch (error) {
          console.error('Important Topics PDF Error:', error.message);
          bot.sendMessage(chatId, '❌ Failed to process PDF.');
        }
      });

    } else if (choice === '📘 Type Subject') {
      bot.sendMessage(chatId, 'Please type the subject name (e.g., "Computer Networks")');

      bot.once('message', async (subjectMsg) => {
        const subject = subjectMsg.text;

        bot.sendMessage(chatId, `📚 Finding key topics for "${subject}"...`);

        const prompt = `
          List the most important and frequently asked topics from the subject "${subject}" for college-level students.
        `;

        try {
          const aiResponse = await queryOpenRouter(prompt);
          bot.sendMessage(chatId, `📝 Important Topics:\n\n${aiResponse}`);
        } catch (error) {
          console.error('Important Topics Subject Error:', error.message);
          bot.sendMessage(chatId, '❌ Failed to generate topics.');
        }
      });
    } else {
      bot.sendMessage(chatId, '❗ Please choose one of the options.');
    }
  });
};
