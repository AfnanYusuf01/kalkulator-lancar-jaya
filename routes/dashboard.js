const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/dashboard/stats
// Hanya diakses oleh Superadmin & Admin
router.get('/stats', protect, restrictTo('superadmin', 'admin'), async (req, res) => {
  try {
    const [totals] = await pool.query(`
      SELECT 
        COUNT(*) as total_proposals,
        IFNULL(SUM(profit), 0) as total_profit,
        IFNULL(AVG(margin_percent), 0) as avg_margin,
        IFNULL(SUM(direct_cost), 0) as total_direct_cost,
        IFNULL(SUM(full_cost), 0) as total_full_cost,
        IFNULL(SUM(sell_price), 0) as total_sell_price
      FROM proposals
    `);

    const [proposals] = await pool.query('SELECT details_json FROM proposals');
    
    // Hitung agregasi sebaran cost berdasarkan group_name
    const costSpread = {
      HANDLING: 0,
      MUTHOWIF: 0,
      KATERING: 0,
      DRIVER: 0,
      PHOTO: 0,
      MEDIS: 0,
      TAMBAHAN: 0
    };

    let totalDirectCostSum = 0;
    
    proposals.forEach(p => {
      try {
        const details = JSON.parse(p.details_json);
        details.forEach(item => {
          const group = item.group_name || item.g;
          const subtotal = parseFloat(item.subtotal || item.sb || 0);
          if (costSpread[group] !== undefined) {
            costSpread[group] += subtotal;
            totalDirectCostSum += subtotal;
          }
        });
      } catch (e) {
        // ignore parsing error
      }
    });

    // Ubah ke persentase
    const costPercentage = {};
    Object.keys(costSpread).forEach(key => {
      costPercentage[key] = totalDirectCostSum > 0 ? (costSpread[key] / totalDirectCostSum) * 100 : 0;
    });

    res.json({
      summary: totals[0],
      costSpread,
      costPercentage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memuat statistik dashboard.' });
  }
});

module.exports = router;
