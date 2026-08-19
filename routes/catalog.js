const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/catalog - Ambil semua item katalog
// Dapat diakses oleh semua pengguna terautentikasi (termasuk role 'user' untuk kalkulasi)
router.get('/', protect, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM catalog ORDER BY group_name, id');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil katalog parameter.' });
  }
});

// PUT /api/catalog/:id - Edit item katalog
// Khusus Superadmin, Admin, dan Inputer
router.put('/:id', protect, restrictTo('superadmin', 'admin', 'inputer'), async (req, res) => {
  const {
    rate_standard,
    rate_maximal,
    rate_premium,
    qty_default,
    is_active_by_default,
    basis,
    scope,
    is_level_adjusted,
    is_catering_tier
  } = req.body;
  const itemId = req.params.id;

  try {
    const [existing] = await pool.query('SELECT id FROM catalog WHERE id = ?', [itemId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Item katalog tidak ditemukan.' });
    }

    await pool.query(
      `UPDATE catalog 
       SET rate_standard = ?, rate_maximal = ?, rate_premium = ?, qty_default = ?, 
           is_active_by_default = ?, basis = ?, scope = ?, 
           is_level_adjusted = ?, is_catering_tier = ?
       WHERE id = ?`,
      [
        rate_standard !== undefined ? parseFloat(rate_standard) : 0,
        rate_maximal !== undefined ? parseFloat(rate_maximal) : 0,
        rate_premium !== undefined ? parseFloat(rate_premium) : 0,
        qty_default !== undefined ? parseFloat(qty_default) : 1,
        is_active_by_default !== undefined ? (is_active_by_default ? 1 : 0) : 1,
        basis || 'FLAT',
        scope || 'OPTIONAL',
        is_level_adjusted ? 1 : 0,
        is_catering_tier ? 1 : 0,
        itemId
      ]
    );

    res.json({ message: 'Item katalog berhasil diperbarui.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui item katalog.' });
  }
});

// POST /api/catalog - Tambah item katalog baru secara dinamis
// Khusus Superadmin, Admin, dan Inputer
router.post('/', protect, restrictTo('superadmin', 'admin', 'inputer'), async (req, res) => {
  const {
    group_name,
    item_name,
    basis,
    rate_standard,
    rate_maximal,
    rate_premium,
    qty_default,
    scope,
    is_level_adjusted,
    is_catering_tier,
    is_active_by_default
  } = req.body;

  if (!group_name || !item_name || !basis) {
    return res.status(450).json({ message: 'Kategori (group_name), nama layanan (item_name), dan basis wajib diisi.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO catalog (
        group_name, item_name, basis, rate_standard, rate_maximal, rate_premium,
        qty_default, scope, is_level_adjusted, is_catering_tier, is_active_by_default, is_custom
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        group_name.trim().toUpperCase(),
        item_name.trim(),
        basis.trim().toUpperCase(),
        parseFloat(rate_standard) || 0,
        parseFloat(rate_maximal) || 0,
        parseFloat(rate_premium) || 0,
        parseFloat(qty_default) || 1,
        scope || 'OPTIONAL',
        is_level_adjusted ? 1 : 0,
        is_catering_tier ? 1 : 0,
        is_active_by_default !== undefined ? (is_active_by_default ? 1 : 0) : 1
      ]
    );

    res.json({ id: result.insertId, message: 'Item katalog berhasil ditambahkan.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan item katalog.' });
  }
});

// DELETE /api/catalog/:id - Hapus item katalog
// Khusus Superadmin dan Admin
router.delete('/:id', protect, restrictTo('superadmin', 'admin'), async (req, res) => {
  const itemId = req.params.id;
  try {
    const [existing] = await pool.query('SELECT id FROM catalog WHERE id = ?', [itemId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Item katalog tidak ditemukan.' });
    }
    await pool.query('DELETE FROM catalog WHERE id = ?', [itemId]);
    res.json({ message: 'Item katalog berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus item katalog.' });
  }
});

module.exports = router;
