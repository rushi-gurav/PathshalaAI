const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const pdfParse = require('pdf-parse');
const { analyzeFrequentQuestions } = require('../../utils/paperHelper');


module.exports = async (bot, msg) => {
  const chatId = msg.chat.id;
  const files = [];

  bot.sendMessage(chatId, '📄 Please upload up to 4 PDF question papers (one by one). Type /done when finished.');

  const handleDocument = async (docMsg) => {
    if (docMsg.document.mime_type !== 'application/pdf') {
      return bot.sendMessage(chatId, '❌ Only PDF files are supported.');
    }

    const fileId = docMsg.document.file_id;
    const fileUrl = await bot.getFileLink(fileId);
    const response = await fetch(fileUrl.href || fileUrl);
    const buffer = await response.buffer();

    files.push(buffer);
    bot.sendMessage(chatId, `✅ Added: ${docMsg.document.file_name}`);
  };

  const handleDone = async () => {
    if (files.length === 0) {
      return bot.sendMessage(chatId, '❌ No PDFs uploaded. Start again.');
    }

    bot.sendMessage(chatId, '🧠 Analyzing uploaded papers for frequently asked questions...');
    const aiResult = await analyzeFrequentQuestions(files);

    bot.sendMessage(chatId, `📊 Most Frequently Asked Questions:\n\n${aiResult}`);
    bot.removeListener('document', handleDocument);
    bot.removeListener('message', messageListener);
  };

  const messageListener = async (message) => {
    if (message.text === '/done') {
      return await handleDone();
    }
  };

  bot.on('document', handleDocument);
  bot.on('message', messageListener);
};
