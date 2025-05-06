const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const fetch = require('node-fetch'); // Ensure node-fetch is installed

async function extractTextFromFile(bot, fileId, mimeType) {
  try {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    const response = await fetch(fileUrl);
    const buffer = await response.buffer();

    let text = '';

    if (mimeType === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (mimeType === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return null;
    }

    return text.trim();
  } catch (error) {
    console.error('❌ Error in extractTextFromFile:', error.message);
    return null;
  }
}

module.exports = {
  extractTextFromFile
};
