const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/proposals - List all proposals (filtered by role)
router.get('/', protect, async (req, res) => {
  try {
    let query = 'SELECT p.*, u.username as creator_name FROM proposals p JOIN users u ON p.created_by = u.id';
    let params = [];

    // Jika role user (client), batasi hanya melihat proposal yang mereka buat sendiri
    if (req.user.role === 'user') {
      query += ' WHERE p.created_by = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY p.id DESC';
    const [rows] = await pool.query(query, params);

    // Filter output data untuk role 'user'
    const filteredRows = rows.map(proposal => {
      if (req.user.role === 'user') {
        const p = { ...proposal };
        delete p.direct_cost;
        delete p.full_cost;
        delete p.margin_percent;
        delete p.profit;
        delete p.details_json; // User/client tidak butuh rincian cost JSON di tabel list
        return p;
      }
      return proposal;
    });

    res.json(filteredRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data proposal.' });
  }
});

// GET /api/proposals/:id - Detail proposal
router.get('/:id', protect, async (req, res) => {
  const proposalId = req.params.id;

  try {
    const query = 'SELECT p.*, u.username as creator_name FROM proposals p JOIN users u ON p.created_by = u.id WHERE p.id = ?';
    const [rows] = await pool.query(query, [proposalId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Proposal tidak ditemukan.' });
    }

    const proposal = rows[0];

    // Cek otorisasi untuk role user
    if (req.user.role === 'user' && proposal.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk proposal ini.' });
    }

    // Filter data finansial sensitif jika user adalah client ('user')
    if (req.user.role === 'user') {
      delete proposal.direct_cost;
      delete proposal.full_cost;
      delete proposal.margin_percent;
      delete proposal.profit;

      if (proposal.details_json) {
        try {
          const details = JSON.parse(proposal.details_json);
          // Hanya kembalikan nama item dan qty, kosongkan tarif/subtotal internal
          const cleanedDetails = details.map(item => ({
            group_name: item.group_name || item.g,
            item_name: item.item_name || item.n,
            qty: item.qty || item.q,
            basis: item.basis || item.b
          }));
          proposal.details_json = JSON.stringify(cleanedDetails);
        } catch (e) {
          proposal.details_json = '[]';
        }
      }
    }

    res.json(proposal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil detail proposal.' });
  }
});

// POST /api/proposals - Simpan proposal baru
// Diperbolehkan untuk Superadmin, Admin, & User (Client)
router.post('/', protect, restrictTo('superadmin', 'admin', 'user'), async (req, res) => {
  const {
    client_name,
    pax_count,
    package_type,
    duration_days,
    hotel_in,
    hotel_out,
    catering_class,
    tips_scenario,
    exchange_rate,
    overhead_percent,
    margin_percent,
    direct_cost,
    full_cost,
    sell_price,
    profit,
    details_json
  } = req.body;

  if (!client_name || !pax_count || !package_type || !details_json) {
    return res.status(400).json({ message: 'Data proposal tidak lengkap.' });
  }

  try {
    // Tentukan status persetujuan berdasarkan margin keuntungan target
    let finalStatus = 'APPROVED';
    if (req.user.role === 'user') {
      const [settingRows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['min_margin']);
      const targetMinMargin = settingRows.length > 0 ? parseFloat(settingRows[0].setting_value) : 20.00;
      if (parseFloat(margin_percent) < targetMinMargin) {
        finalStatus = 'PENDING_APPROVAL';
      }
    }

    // Generate proposal number: PRP-YYYYMMDD-RAND
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const proposalNumber = `PRP-${dateStr}-${randomNum}`;

    const [result] = await pool.query(
      `INSERT INTO proposals (
        proposal_number, client_name, pax_count, package_type, duration_days, hotel_in, hotel_out, 
        catering_class, tips_scenario, exchange_rate, overhead_percent, margin_percent, 
        direct_cost, full_cost, sell_price, profit, details_json, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        proposalNumber,
        client_name,
        pax_count,
        package_type,
        duration_days || 7,
        hotel_in || 2,
        hotel_out || 2,
        catering_class || 'Reguler',
        tips_scenario || 'Standar',
        exchange_rate || 4800,
        overhead_percent || 10,
        margin_percent || 20,
        direct_cost,
        full_cost,
        sell_price,
        profit,
        typeof details_json === 'string' ? details_json : JSON.stringify(details_json),
        finalStatus,
        req.user.id
      ]
    );

    res.status(201).json({
      message: finalStatus === 'PENDING_APPROVAL' 
        ? 'Proposal disimpan dan diajukan untuk persetujuan Admin karena margin di bawah batas target.' 
        : 'Proposal berhasil disimpan.',
      proposalId: result.insertId,
      proposalNumber,
      status: finalStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menyimpan proposal.' });
  }
});

// PUT /api/proposals/:id/status - Persetujuan proposal oleh Admin / Superadmin
router.put('/:id/status', protect, restrictTo('superadmin', 'admin'), async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Status persetujuan tidak valid.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM proposals WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Proposal tidak ditemukan.' });
    }

    await pool.query('UPDATE proposals SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Proposal berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui status proposal.' });
  }
});

module.exports = router;
