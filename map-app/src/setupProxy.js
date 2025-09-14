const { createProxyMiddleware } = require("http-proxy-middleware");

// ê°œë°œ ?˜ê²½?ì„œ ëª¨ë“  /api/* ?”ì²­??Flask ë°±ì—”?œë¡œ ?„ë¡?œí•©?ˆë‹¤.
// ë°±ì—”??app.py)ê°€ /api/persona, /api/seoul-data, /api/kakao-waypoints, /api/translate ?±ì„ ?œê³µ?©ë‹ˆ??

module.exports = function (app) {
  const target = process.env.REACT_APP_BACKEND_ORIGIN || "http://127.0.0.1:5001";
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};

