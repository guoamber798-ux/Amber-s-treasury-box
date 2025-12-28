const https = require('https');

exports.handler = async function(event) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  
  // 构造发给 Google 的指令
  const payload = JSON.stringify({
    contents: [{ parts: [{ text: "以JSON格式返回：USD对CNY汇率，以及AAPL股票最新价格。" }] }]
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          // 提取 AI 返回的文本内容
          const aiText = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
          resolve({ statusCode: 200, headers: { "Content-Type": "application/json" }, body: aiText });
        } catch (e) {
          resolve({ statusCode: 200, body: JSON.stringify({ rates: { CNY: 7.24 }, prices: [] }) });
        }
      });
    });
    req.write(payload);
    req.end();
  });
};
