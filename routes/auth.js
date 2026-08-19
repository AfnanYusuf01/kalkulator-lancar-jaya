const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { protect, restrictTo } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'supersecretkeylancarjayacalculator123',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, role FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/auth/users (Superadmin only)
router.get('/users', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data user.' });
  }
});

// POST /api/auth/users (Superadmin only)
router.post('/users', protect, restrictTo('superadmin'), async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Data tidak lengkap.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );

    res.status(201).json({
      message: 'User berhasil dibuat.',
      user: { id: result.insertId, username, role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat user.' });
  }
});

// PUT /api/auth/users/:id (Superadmin only)
router.put('/users/:id', protect, restrictTo('superadmin'), async (req, res) => {
  const { role, password } = req.body;
  const userId = req.params.id;

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET role = ?, password = ? WHERE id = ?', [role, hashedPassword, userId]);
    } else {
      await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    }
    res.json({ message: 'Data user berhasil diperbarui.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui user.' });
  }
});

// DELETE /api/auth/users/:id (Superadmin only)
router.delete('/users/:id', protect, restrictTo('superadmin'), async (req, res) => {
  const userId = req.params.id;

  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: 'Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif.' });
  }

  try {
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus user.' });
  }
});

module.exports = router;
