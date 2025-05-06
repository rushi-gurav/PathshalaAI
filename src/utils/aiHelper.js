const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { openRouterKey } = require('../config');

const queryOpenRouter = async (prompt) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen-2.5-72b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
};

module.exports = { queryOpenRouter };
