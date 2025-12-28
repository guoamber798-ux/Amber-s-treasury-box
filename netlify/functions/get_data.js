const https = require('https');

exports.handler = async function(event, context) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const POLYGON_KEY = process.env.POLYGON_API_KEY;

  // 接收前端传来的资产列表
  const { holdingsString } = JSON.parse(event.body || '{}');

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

  const callGemini = () => {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        contents: [{ parts: [{ text: `Get prices for: [${holdingsString}]. Return valid JSON: {"rates":{"CNY":number,"HKD":number},"prices":[{"symbol":"string","price":number}]}` }] }]
      });

      const req = https.request(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve({ ok: res.statusCode === 200, data: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  };

  try {
    const result = await callGemini();
    if (result.ok) {
      // 提取 AI 返回的文本并清理
      const aiText = result.data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
      return { statusCode: 200, body: aiText };
    }
    throw new Error('Gemini Down');
  } catch (error) {
    // 备选保底：Gemini 额度用完时，返回默认汇率
    return { statusCode: 200, body: JSON.stringify({ rates: { CNY: 7.24, HKD: 7.82 }, prices: [] }) };
  }
};
