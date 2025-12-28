// 这是一个“后端”函数，运行在 Netlify 服务器上，而不是用户浏览器里
exports.handler = async function(event, context) {
  // 从 Netlify 后台保险柜取 Key
  const API_KEY = process.env.API_KEY; 
  
  // 这里写你要干的事，比如去问 Google AI 或者 Polygon
  // 为了测试，我们先让它返回“连接成功”
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "安全连接已建立", status: "Key已就绪" })
  };
};
