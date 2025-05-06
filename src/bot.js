const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { botToken } = require('./config');

// ✅ Command Handlers
const studentChat = require('./commands/students/chat');
const studentGenerateQuestions = require('./commands/students/generateQuestions');
const studentImportantTopics = require('./commands/students/importantTopics');
const studentAnalyzePapers = require('./commands/students/analyzeQuestionPapers');

const profChat = require('./commands/professor/chat');
const attendance = require('./commands/professor/attendance');
const questionBank = require('./commands/professor/questionBank');
const timetable = require('./commands/professor/timetable');

// ✅ Token Check
if (!botToken) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found.");
  process.exit(1);
}

// ✅ Initialize Bot
const bot = new TelegramBot(botToken, {
  polling: {
    interval: 300,
    autoStart: true,
    params: { timeout: 10 }
  },
  request: { timeout: 20000 }
});

console.log('🤖 Bot started and polling...');

let userMode = {}; // Store user mode for session-style routing

// ✅ Start Command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userMode[chatId] = null;

  bot.sendMessage(chatId, `Welcome ${msg.chat.first_name || ''}! Who are you?`, {
    reply_markup: {
      keyboard: [['👨‍🎓 Student'], ['👨‍🏫 Professor']],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// ✅ Handle All Messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  // 🎓 Role Selection
  if (text === '👨‍🎓 Student') {
    userMode[chatId] = 'student';
    return bot.sendMessage(chatId,
      `🎓 Student Mode Selected!\n\nChoose a command:`, {
        reply_markup: {
          keyboard: [
            ['/ask', '/generatequestions'],
            ['/importanttopics', '/analyzequestions'],
            ['🔙 Back']
          ],
          resize_keyboard: true
        }
      });
  }

  if (text === '👨‍🏫 Professor') {
    userMode[chatId] = 'professor';
    return bot.sendMessage(chatId,
      `👨‍🏫 Professor Mode Selected!\n\nChoose a command:`, {
        reply_markup: {
          keyboard: [
            ['/ask', '/attendance'],
            ['/questionbank', '/timetable'],
            ['🔙 Back']
          ],
          resize_keyboard: true
        }
      });
  }

  // 🔙 Go Back
  if (text === '🔙 Back') {
    userMode[chatId] = null;
    return bot.sendMessage(chatId, `👋 Back to main menu. Who are you?`, {
      reply_markup: {
        keyboard: [['👨‍🎓 Student'], ['👨‍🏫 Professor']],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  }

  // 🧠 Smart Commands
  const mode = userMode[chatId];

  if (text.startsWith('/ask')) {
    if (mode === 'student') return studentChat(bot, msg);
    else if (mode === 'professor') return profChat(bot, msg);
    else return bot.sendMessage(chatId, "❓ Please select your role first by using /start.");
  }

  if (text.startsWith('/generatequestions')) return studentGenerateQuestions(bot, msg);
  if (text.startsWith('/importanttopics')) return studentImportantTopics(bot, msg);
  if (text.startsWith('/analyzequestions')) return studentAnalyzePapers(bot, msg);

  if (text.startsWith('/attendance')) return attendance(bot, msg);
  if (text.startsWith('/questionbank')) return questionBank(bot, msg);
  if (text.startsWith('/timetable')) return timetable(bot, msg);
});

// ✅ Catch Polling Errors
bot.on('polling_error', (error) => {
  console.error('❌ Polling Error:', error.code, error.message || '');
});

if (require.main === module) {
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.get('/', (req, res) => {
    res.send('✅ Your Telegram Bot is alive on Render!');
  });

  app.listen(PORT, () => {
    console.log(`🚀  server running on port ${PORT} to keep bot alive`);
  });
}

module.exports = bot;
