const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const fetch = require('node-fetch'); // node-fetch v2 recommended
const cron = require('node-cron');
const { sendEmail } = require('../../utils/emailHelper');

const scheduledUsers = new Set();

module.exports = (bot, msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, '📧 Please enter your email address to receive daily class schedule reminders.');

  bot.once('message', (emailMsg) => {
    const email = emailMsg.text.trim();

    // Basic email format check
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return bot.sendMessage(chatId, '❌ Invalid email address. Please try again using a valid email.');
    }

    bot.sendMessage(chatId, '📄 Now upload your class timetable Excel file (.xlsx format only).');

    bot.once('document', async (docMsg) => {
      const fileId = docMsg.document.file_id;
      const fileName = docMsg.document.file_name;
      const fileExtension = path.extname(fileName);

      if (fileExtension !== '.xlsx') {
        return bot.sendMessage(chatId, '❌ Only Excel (.xlsx) files are supported.');
      }

      try {
        // Get file info from Telegram server
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

        // Fetch the file as a buffer
        const response = await fetch(fileUrl);
        const buffer = await response.buffer();

        // Define the destination directory and file path
        const generatedDir = path.join(__dirname, '../../generated');
        if (!fs.existsSync(generatedDir)) {
          fs.mkdirSync(generatedDir, { recursive: true });
        }

        const destPath = path.join(generatedDir, `timetable_${chatId}.xlsx`);
        fs.writeFileSync(destPath, buffer);

        bot.sendMessage(chatId, '✅ Timetable uploaded successfully!\n📬 You will now receive daily class reminders at 7:00 AM.');

        // Schedule the cron job for daily reminders
        scheduleCronForUser(chatId, email, destPath);
      } catch (err) {
        console.error('❌ Error processing timetable upload:', err.message || err);
        bot.sendMessage(chatId, '❌ Failed to upload or process the file. Please try again.');
      }
    });
  });
};

// 🕖 Cron job for daily reminders at 7 AM IST
function scheduleCronForUser(chatId, email, filePath) {
  if (scheduledUsers.has(chatId)) return;
  scheduledUsers.add(chatId);

  cron.schedule('0 7 * * *', async () => {
    try {
      const todaySchedule = await getTodaySchedule(filePath);
      if (todaySchedule.length > 0) {
        await sendEmail(email, todaySchedule);
        console.log(`📧 Email sent to ${email}`);
      } else {
        console.log(`ℹ️ No classes today for chat ${chatId}`);
      }
    } catch (err) {
      console.error(`❌ Failed to send schedule to ${email}:`, err.message || err);
    }
  }, {
    timezone: 'Asia/Kolkata',
  });

  console.log(`⏰ Daily email scheduled for ${email}`);
}

// 📅 Parse today’s schedule from the Excel file
async function getTodaySchedule(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet(1);
  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });

  const schedule = [];

  sheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return; // Skip header

    const day = row.getCell(1).text?.trim();
    const subject = row.getCell(2).text?.trim();
    const time = row.getCell(3).text?.trim();

    if (day && day.toLowerCase() === todayDay.toLowerCase()) {
      schedule.push(`🕐 ${time} - 📚 ${subject}`);
    }
  });

  return schedule;
}
