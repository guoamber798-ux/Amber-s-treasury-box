const https = require('https');

exports.handler = async function(event, context) {
  // 获取 Netlify 后台配置的 Key
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const POLYGON_KEY = process.env.POLYGON_API_KEY;

  // 网络请求小助手
  const postToGemini = (url, data) => {
    return new Promise((resolve, reject) => {
      const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve({ ok: res.statusCode === 200, data: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify(data));
      req.end();
    });
  };

  try {
    // 方案 A：主力使用 Gemini 2.0 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    const result = await postToGemini(geminiUrl, {
      contents: [{ parts: [{ text: "以JSON格式返回AAPL现在的价格，包含字段：price, change。" }] }]
    });

    if (result.ok) return { statusCode: 200, body: JSON.stringify(result.data) };
    throw new Error('Gemini 额度可能满了');

  } catch (error) {
    // 方案 B：自动切换到 Polygon 备选
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "正在切换至备用行情源...", error: error.message })
    };
  }
};const https = require('https');

exports.handler = async function(event, context) {
  // 获取 Netlify 后台配置的 Key
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const POLYGON_KEY = process.env.POLYGON_API_KEY;

  // 网络请求小助手
  const postToGemini = (url, data) => {
    return new Promise((resolve, reject) => {
      const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve({ ok: res.statusCode === 200, data: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify(data));
      req.end();
    });
  };

  try {
    // 方案 A：主力使用 Gemini 2.0 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    const result = await postToGemini(geminiUrl, {
      contents: [{ parts: [{ text: "以JSON格式返回AAPL现在的价格，包含字段：price, change。" }] }]
    });

    if (result.ok) return { statusCode: 200, body: JSON.stringify(result.data) };
    throw new Error('Gemini 额度可能满了');

  } catch (error) {
    // 方案 B：自动切换到 Polygon 备选
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "正在切换至备用行情源...", error: error.message })
    };
  }
};
