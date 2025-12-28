const https = require('https');

exports.handler = async function(event, context) {
  // 从 Netlify 安全柜获取两个 Key
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const POLYGON_KEY = process.env.POLYGON_API_KEY;
  
  // 1. 接收前端传过来的资产列表（Holdings）
  const { holdingsString } = JSON.parse(event.body || '{}');

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

  const prompt = `I have a portfolio with assets: [${holdingsString}]. 
  Task: 1. Find market price for each in specified currency. 
  2. Find exchange rates: USD to CNY, USD to HKD. 
  Return ONLY valid JSON: {"rates": {"CNY": number, "HKD": number}, "prices": [{"symbol": "string", "price": number}]}`;

  const callGemini = () => {
    return new Promise((resolve, reject) => {
      const req = https.request(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve({ ok: res.statusCode === 200, data: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }));
      req.end();
    });
  };

  try {
    // 主力方案：Gemini
    const result = await callGemini();
    if (result.ok) {
        // 提取 Gemini 返回的纯文本并解析成 JSON
        const aiText = result.data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
        return { statusCode: 200, body: aiText };
    }
    throw new Error('Gemini Line Down');
  } catch (error) {
    // 备选方案：Polygon (这里可以写简单的汇率逻辑保底)
    return { 
      statusCode: 200, 
      body: JSON.stringify({ rates: { CNY: 7.24, HKD: 7.82 }, prices: [], note: "Backup active" }) 
    };
  }
};
