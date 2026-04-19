const express = require('express');
const router = express.Router();
const { getSchoolInfo } = require('../controllers/publicController');

// Route untuk mendapatkan informasi umum sekolah
router.get('/school-info', getSchoolInfo);

module.exports = router;