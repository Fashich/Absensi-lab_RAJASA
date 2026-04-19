const express = require('express');
const { body } = require('express-validator');
const { login, logout } = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const router = express.Router();

// Route untuk login
router.post('/login', [
  body('username').notEmpty().withMessage('Username harus diisi'),
  body('password').notEmpty().withMessage('Password harus diisi')
], validate, login);

// Route untuk logout
router.post('/logout', logout);

module.exports = router;