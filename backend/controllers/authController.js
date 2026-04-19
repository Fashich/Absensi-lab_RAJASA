const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const [users] = await db.execute(
      'SELECT id, username, password, nama_lengkap, email, role, foto_profil, status_aktif FROM users WHERE username = ? AND status_aktif = TRUE',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    const user = users[0];

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Update last_login
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Kirim respons dengan token dan data user
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama_lengkap,
        email: user.email,
        role: user.role,
        foto_profil: user.foto_profil
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout
const logout = (req, res) => {
  // Di frontend, hapus token dari localStorage
  res.json({
    success: true,
    message: 'Logout berhasil'
  });
};

module.exports = {
  login,
  logout
};