const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const POLYGON_KEY = process.env.POLYGON_API_KEY;

  // --- 方案 A：主力线路 (Gemini 2.0 Flash) ---
  try {
    // 明确指定使用 gemini-2.0-flash 模型
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: "以JSON格式提供最新的AAPL股票价格数据。返回格式必须包含：price, change_percent。" }] 
        }]
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { 
        statusCode: 200, 
        body: JSON.stringify({ source: 'Gemini-2.0-Flash', data: result }) 
      };
    }
    throw new Error('Gemini 额度超限或不可用');
  } 

  // --- 方案 B：自动切换备选 (Polygon.io) ---
  catch (error) {
    console.warn("Gemini 无法工作，切换至 Polygon 备选方案:", error.message);
    try {
      const polyUrl = `https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey=${POLYGON_KEY}`;
      const polyResponse = await fetch(polyUrl);
      const polyData = await polyResponse.json();
      
      return { 
        statusCode: 200, 
        body: JSON.stringify({ source: 'Polygon-Backup', data: polyData }) 
      };
    } catch (polyError) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "双线路均已失效" }) 
      };
    }
  }
};
