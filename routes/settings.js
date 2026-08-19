const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/settings - Ambil semua konfigurasi pengaturan
router.get('/', protect, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value, description FROM settings');
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = parseFloat(r.setting_value);
    });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil pengaturan.' });
  }
});

// PUT /api/settings - Perbarui pengaturan margin (Admin/Superadmin)
router.put('/', protect, restrictTo('superadmin', 'admin'), async (req, res) => {
  const { min_margin, floor_margin } = req.body;

  try {
    if (min_margin !== undefined) {
      const parsedMin = parseFloat(min_margin);
      if (isNaN(parsedMin) || parsedMin < 0 || parsedMin > 100) {
        return res.status(400).json({ message: 'Target margin harus berkisar antara 0% - 100%.' });
      }
      await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [parsedMin.toFixed(2), 'min_margin']);
    }

    if (floor_margin !== undefined) {
      const parsedFloor = parseFloat(floor_margin);
      if (isNaN(parsedFloor) || parsedFloor < 0 || parsedFloor > 100) {
        return res.status(400).json({ message: 'Batas bawah margin harus berkisar antara 0% - 100%.' });
      }
      await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [parsedFloor.toFixed(2), 'floor_margin']);
    }

    res.json({ message: 'Pengaturan berhasil diperbarui.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui pengaturan.' });
  }
});

module.exports = router;
