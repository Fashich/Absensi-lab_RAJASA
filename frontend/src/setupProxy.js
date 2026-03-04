const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost/project_magang/backend',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // menghapus "/api" dari path target
      },
      // Menambahkan konfigurasi middleware untuk menghindari peringatan
      onProxyReq: (proxyReq, req, res) => {
        // Menambahkan header CORS ke permintaan
        proxyReq.setHeader('Origin', 'http://localhost:3000');
      },
      onProxyRes: (proxyRes, req, res) => {
        // Menyalin header CORS dari target ke respons
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
      },
    })
  );
};