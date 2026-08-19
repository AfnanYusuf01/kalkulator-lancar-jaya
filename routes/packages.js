const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/packages - Ambil semua paket beserta item catalog pendukungnya
router.get('/', protect, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, GROUP_CONCAT(pi.catalog_id) as catalog_ids
      FROM packages p
      LEFT JOIN package_items pi ON p.id = pi.package_id
      GROUP BY p.id
    `);

    const packages = rows.map(r => ({
      id: r.id,
      package_code: r.package_code,
      package_name: r.package_name,
      description: r.description,
      catalog_ids: r.catalog_ids ? r.catalog_ids.split(',').map(id => parseInt(id)) : []
    }));

    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil paket perjalanan.' });
  }
});

// POST /api/packages - Tambah paket baru secara dinamis
router.post('/', protect, restrictTo('superadmin', 'admin', 'inputer'), async (req, res) => {
  const { package_code, package_name, description, catalog_ids } = req.body;

  if (!package_code || !package_name) {
    return res.status(400).json({ message: 'Kode paket dan nama paket wajib diisi.' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Check if code exists
    const [existing] = await connection.query('SELECT id FROM packages WHERE package_code = ?', [package_code.trim().toUpperCase()]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Kode paket sudah digunakan.' });
    }

    const [result] = await connection.query(
      'INSERT INTO packages (package_code, package_name, description) VALUES (?, ?, ?)',
      [package_code.trim().toUpperCase(), package_name.trim(), description || '']
    );

    const packageId = result.insertId;

    if (Array.isArray(catalog_ids) && catalog_ids.length > 0) {
      const linkValues = catalog_ids.map(catalogId => [packageId, parseInt(catalogId)]);
      await connection.query(
        'INSERT INTO package_items (package_id, catalog_id) VALUES ?',
        [linkValues]
      );
    }

    await connection.commit();
    connection.release();
    res.json({ id: packageId, message: 'Paket berhasil ditambahkan.' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error(error);
    res.status(500).json({ message: 'Gagal menambahkan paket baru.' });
  }
});

// PUT /api/packages/:id - Perbarui paket perjalanan
router.put('/:id', protect, restrictTo('superadmin', 'admin', 'inputer'), async (req, res) => {
  const packageId = req.params.id;
  const { package_name, description, catalog_ids } = req.body;

  if (!package_name) {
    return res.status(400).json({ message: 'Nama paket wajib diisi.' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [existing] = await connection.query('SELECT id FROM packages WHERE id = ?', [packageId]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Paket tidak ditemukan.' });
    }

    await connection.query(
      'UPDATE packages SET package_name = ?, description = ? WHERE id = ?',
      [package_name.trim(), description || '', packageId]
    );

    // Re-link items: delete current links then insert new ones
    await connection.query('DELETE FROM package_items WHERE package_id = ?', [packageId]);

    if (Array.isArray(catalog_ids) && catalog_ids.length > 0) {
      const linkValues = catalog_ids.map(catalogId => [parseInt(packageId), parseInt(catalogId)]);
      await connection.query(
        'INSERT INTO package_items (package_id, catalog_id) VALUES ?',
        [linkValues]
      );
    }

    await connection.commit();
    connection.release();
    res.json({ message: 'Paket berhasil diperbarui.' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui paket.' });
  }
});

// DELETE /api/packages/:id - Hapus paket perjalanan
router.delete('/:id', protect, restrictTo('superadmin', 'admin'), async (req, res) => {
  const packageId = req.params.id;
  try {
    const [existing] = await pool.query('SELECT id FROM packages WHERE id = ?', [packageId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Paket tidak ditemukan.' });
    }
    await pool.query('DELETE FROM packages WHERE id = ?', [packageId]);
    res.json({ message: 'Paket berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus paket.' });
  }
});

module.exports = router;
