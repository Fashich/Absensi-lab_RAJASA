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
        // Optional: Menangani permintaan proxy
      },
      onProxyRes: (proxyRes, req, res) => {
        // Optional: Menangani respons proxy
      },
    })
  );
};