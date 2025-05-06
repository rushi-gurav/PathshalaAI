require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  openRouterKey: process.env.OPENROUTER_API_KEY,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS
};
