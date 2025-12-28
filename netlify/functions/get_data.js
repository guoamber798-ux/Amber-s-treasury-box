const https = require('https');

exports.handler = async function(event, context) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const POLYGON_KEY = process.env.POLYGON_API_KEY;

  // 这是一个帮我们处理网络请求的小助手
  const makeRequest = (url, method = 'GET', postData = null) => {
    return new Promise((resolve, reject) => {
      const options = { method };
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ ok: res.statusCode < 300, data: JSON.parse(data) }));
      });
      req.on('error', (e) => reject(e));
      if (postData) req.write(JSON.stringify(postData));
      req.end();
    });
  };

  try {
    // 方案 A: 尝试 Gemini 2.0 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    const geminiRes = await makeRequest(geminiUrl, 'POST', {
      contents: [{ parts: [{ text: "Return AAPL price in JSON format." }] }]
    });

    if (geminiRes.ok) return { statusCode: 200, body: JSON.stringify({ source: 'Gemini', ...geminiRes.data }) };
    throw new Error('Gemini failed');

  } catch (error) {
    // 方案 B: 备选 Polygon
    try {
      const polyUrl = `https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey=${POLYGON_KEY}`;
      const polyRes = await makeRequest(polyUrl);
      return { statusCode: 200, body: JSON.stringify({ source: 'Polygon', ...polyRes.data }) };
    } catch (e) {
      return { statusCode: 500, body: "Both services failed" };
    }
  }
};
