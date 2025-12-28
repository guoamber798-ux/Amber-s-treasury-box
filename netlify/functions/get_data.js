const https = require('https');

exports.handler = async function(event, context) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const POLYGON_KEY = process.env.POLYGON_API_KEY;

  try {
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: "以JSON格式返回AAPL现在的价格，包含字段：price, change。" }] }]
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
          const data = JSON.parse(body);
          const aiText = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
          resolve({ statusCode: 200, headers: { "Content-Type": "application/json" }, body: aiText });
        });
      });
      req.on('error', () => resolve({ statusCode: 200, body: JSON.stringify({ rates: { CNY: 7.24, HKD: 7.82 }, prices: [] }) }));
      req.write(payload);
      req.end();
    });
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ rates: { CNY: 7.24, HKD: 7.82 }, prices: [] }) };
  }
};
