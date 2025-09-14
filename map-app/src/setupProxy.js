const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Add COOP header for all dev responses to avoid Google popup/redirect warnings
  app.use((req, res, next) => {
    try {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    } catch (e) {}
    next();
  });

  const target = process.env.REACT_APP_BACKEND_ORIGIN || "http://127.0.0.1:5001";
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
