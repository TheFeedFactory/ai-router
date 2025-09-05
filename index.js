const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = process.env.TARGET_URL || "http://10.100.0.1:3002";

const proxyOptions = {
  target: TARGET_URL,
  changeOrigin: true,
  // Don't rewrite the path - keep /api/ai prefix as the backend expects it
  onProxyReq: (proxyReq, req, res) => {
    console.log(
      `Proxying ${req.method} ${req.path} -> ${TARGET_URL}${req.path}`
    );
  },
  onError: (err, req, res) => {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Proxy error", message: err.message });
  },
};

app.use("/api/ai", createProxyMiddleware(proxyOptions));

app.get("/health", (req, res) => {
  res.json({ status: "healthy", target: TARGET_URL });
});

app.listen(PORT, () => {
  console.log(`AI Router proxy listening on port ${PORT}`);
  console.log(`Forwarding /api/ai/* to ${TARGET_URL}/api/ai/*`);
});
