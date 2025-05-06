const { generateAttendanceSheet } = require('../../utils/excelHelper');
const fs = require('fs');

module.exports = (bot, msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, '🎓 Enter the year (e.g., FE, SE, TE, BE)');

  bot.once('message', (yearMsg) => {
    const year = yearMsg.text.toUpperCase();

    bot.sendMessage(chatId, '🏫 Enter the division (e.g., A or B)');

    bot.once('message', (divisionMsg) => {
      const division = divisionMsg.text.toUpperCase();

      bot.sendMessage(chatId, '📘 Enter the subject name (e.g., Computer Networks)');

      bot.once('message', (subjectMsg) => {
        const subject = subjectMsg.text;

        bot.sendMessage(chatId, '🗓️ Enter today\'s date in DD-MM-YYYY format (e.g., 22-04-2025)');

        bot.once('message', (dateMsg) => {
          const date = dateMsg.text;

          bot.sendMessage(chatId, '🧑‍🎓 Now enter **present roll numbers** separated by commas (e.g., 1,2,5,7,9)');

          bot.once('message', async (rollMsg) => {
            const presentRolls = rollMsg.text.split(',').map(r => r.trim());
            const totalStudents = 60; // Update as needed

            const attendanceData = [];

            for (let i = 1; i <= totalStudents; i++) {
              attendanceData.push({
                Roll: i,
                Status: presentRolls.includes(i.toString()) ? 'Present' : 'Absent'
              });
            }

            try {
              const filePath = await generateAttendanceSheet({
                year,
                division,
                subject,
                date,
                data: attendanceData
              });

              bot.sendMessage(chatId, `✅ Attendance sheet for ${year} Div-${division} generated. Sending now...`);
              await bot.sendDocument(chatId, fs.createReadStream(filePath));
            } catch (error) {
              console.error('Attendance Error:', error.message);
              bot.sendMessage(chatId, '❌ Failed to generate attendance file.');
            }
          });
        });
      });
    });
  });
};
