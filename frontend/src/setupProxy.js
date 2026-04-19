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
      // Hapus konfigurasi header CORS karena sudah diatur di sisi server
      onProxyReq: (proxyReq, req, res) => {
        // Hanya mengatur header Origin jika diperlukan untuk server tujuan
        proxyReq.setHeader('Origin', 'http://localhost/project_magang');
      }
    })
  );
};