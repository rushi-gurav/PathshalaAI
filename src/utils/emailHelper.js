const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, schedule) => {
  try {
    if (!to || !Array.isArray(schedule) || schedule.length === 0) {
      throw new Error('Invalid email or schedule provided.');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Routine Bot" <${process.env.EMAIL_USER}>`,
      to,
      subject: '📅 Your Daily Class Timetable Reminder',
      text: `Hello!\n\nHere is your class schedule for today:\n\n${schedule.join('\n')}\n\n✅ Stay focused and have a productive day!`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${to}`);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message || err);
  }
};

module.exports = { sendEmail };
