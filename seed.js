const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const schemaPath = path.join(__dirname, 'database.sql');

async function seed() {
  console.log('Starting Database Seed...');

  // Setup connection without database name initially to create database if it doesn't exist
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    const dbName = process.env.DB_NAME || 'lancar_jaya_db';
    // Ensure DB exists and select it
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);

    // Drop tables to force recreation of new columns and tables
    console.log('Dropping existing tables...');
    await connection.query('DROP TABLE IF EXISTS proposals');
    await connection.query('DROP TABLE IF EXISTS package_items');
    await connection.query('DROP TABLE IF EXISTS packages');
    await connection.query('DROP TABLE IF EXISTS settings');
    await connection.query('DROP TABLE IF EXISTS catalog');
    await connection.query('DROP TABLE IF EXISTS users');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    // Split SQL by semicolon, but ignore semicolons inside comments or strings (simple split is okay for this schema)
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Database and Tables created successfully.');

    // Switch to database
    await connection.changeUser({ database: process.env.DB_NAME || 'lancar_jaya_db' });

    // Clean tables
    console.log('Cleaning existing data...');
    await connection.query('DELETE FROM proposals');
    await connection.query('DELETE FROM package_items');
    await connection.query('DELETE FROM packages');
    await connection.query('DELETE FROM catalog');
    await connection.query('DELETE FROM settings');
    await connection.query('DELETE FROM users');

    // Seed Users
    console.log('Seeding Users...');
    const roles = [
      { username: 'superadmin', pass: 'superadmin123', role: 'superadmin' },
      { username: 'admin', pass: 'admin123', role: 'admin' },
      { username: 'inputer', pass: 'inputer123', role: 'inputer' },
      { username: 'user', pass: 'user123', role: 'user' }
    ];

    for (const user of roles) {
      const hashedPassword = await bcrypt.hash(user.pass, 10);
      await connection.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [user.username, hashedPassword, user.role]
      );
    }
    console.log('Users seeded.');

    // Seed Catalog Items
    console.log('Seeding Catalog Items...');
    const catalogItems = [
      // group_name, item_name, basis, rate_standard, rate_maximal, rate_premium, qty_default, scope, is_level_adjusted, is_catering_tier, bellboy_type, depends_on_item, is_active_by_default
      ['HANDLING', 'Fee Freelancer — Bandara Kedatangan', 'FLAT', 200, 200, 0, 1, 'FULL', true, false, null, null, true],
      ['HANDLING', 'Ongkos Transport PP — Kedatangan', 'FLAT', 260, 260, 0, 1, 'FULL', false, false, null, null, true],
      ['HANDLING', 'Tips Porter — Kedatangan', 'PAX', 20, 20, 0, 1, 'ALL', false, false, null, null, true],
      ['HANDLING', 'Tips Muasasah — Kedatangan', 'FLAT', 20, 50, 0, 1, 'ALL', false, false, null, null, true],
      ['HANDLING', 'Fee Freelancer — Check-in Hotel', 'FLAT', 250, 250, 0, 2, 'ALL', true, false, null, null, true],
      ['HANDLING', 'Tips Bellboy — Check-in', 'FLAT', 70, 70, 0, 2, 'ALL', false, false, 'in', null, true],
      ['HANDLING', 'Fee Freelancer — Check-out Hotel', 'FLAT', 200, 200, 0, 2, 'FULL', true, false, null, null, true],
      ['HANDLING', 'Tips Bellboy — Check-out', 'FLAT', 80, 80, 0, 2, 'FULL', false, false, 'out', null, true],
      ['HANDLING', 'Tips Muasasah — Check-out', 'FLAT', 20, 50, 0, 1, 'ALL', false, false, null, null, true],
      ['HANDLING', 'Fee Freelancer — Bandara Kepulangan', 'FLAT', 250, 250, 0, 1, 'FULL', true, false, null, null, true],
      ['HANDLING', 'Ongkos Transport PP — Kepulangan', 'FLAT', 260, 260, 0, 1, 'FULL', false, false, null, null, true],
      ['HANDLING', 'Tips Porter — Kepulangan', 'PAX', 20, 20, 0, 1, 'ALL', false, false, null, null, true],
      ['HANDLING', 'Tips Petugas Zamzam', 'FLAT', 20, 20, 0, 1, 'ALL', false, false, null, 'zam', true],

      ['MUTHOWIF', 'Fee Muthowif (per hari)', 'FLAT', 250, 250, 0, 7, 'ALL', false, false, null, null, true],
      ['MUTHOWIF', 'Ongkos Muthowif PP', 'FLAT', 300, 300, 0, 1, 'ALL', false, false, null, null, true],
      ['MUTHOWIF', 'Fee Muthowifah — Raudhoh', 'FLAT', 200, 200, 0, 1, 'ALL', false, false, null, null, true],
      ['MUTHOWIF', 'Tunjangan Muthowif — Handling Kepulangan', 'FLAT', 50, 50, 0, 1, 'ESN', false, false, null, null, true],

      ['MUTHOWIF', 'Sewa Transmitter (per sesi umroh)', 'PAX', 5, 5, 0, 1, 'OPTIONAL', false, false, null, null, true],
      ['MUTHOWIF', 'Kursi Roda — Proses Umroh (sesi × jama\'ah)', 'FLAT', 250, 250, 0, 0, 'OPTIONAL', false, false, null, null, false],
      ['MUTHOWIF', 'Kursi Roda — Harian (hari × jama\'ah)', 'FLAT', 250, 250, 0, 0, 'OPTIONAL', false, false, null, null, false],
      ['KATERING', 'Meal Box / Nasi Box', 'PAX', 15, 15, 20, 1, 'OPTIONAL', false, true, null, null, true],
      ['KATERING', 'Snack City Tour', 'PAX', 6.5, 6.5, 10, 2, 'OPTIONAL', false, true, null, null, true],
      ['KATERING', 'Snack Madinah–Makkah', 'PAX', 8, 8, 12, 1, 'OPTIONAL', false, true, null, null, true],
      ['KATERING', 'Air Zamzam Galon 5L (bawa pulang)', 'PAX', 12.5, 12.5, 0, 1, 'OPTIONAL', false, false, null, 'zam', true],
      ['KATERING', 'Albaik Kepulangan', 'PAX', 25, 25, 0, 1, 'OPTIONAL', false, false, null, null, false],
      ['KATERING', 'Welcoming Drink (zamzam + cup)', 'FLAT', 22.5, 22.5, 0, 1, 'OPTIONAL', false, false, null, null, true],
      ['DRIVER', 'Tip Driver Bus — 5 rute', 'FLAT', 400, 400, 0, 1, 'OPTIONAL', false, false, null, null, true],
      ['PHOTO', 'Sesi Standar (CT / Nabawi / Umroh Wajib)', 'FLAT', 230, 230, 0, 0, 'OPTIONAL', false, false, null, null, false],
      ['PHOTO', 'Sesi CT Makkah + Umroh Kedua', 'FLAT', 250, 250, 0, 0, 'OPTIONAL', false, false, null, null, false],
      ['PHOTO', 'Sesi Jabal Khandamah', 'FLAT', 280, 280, 0, 0, 'OPTIONAL', false, false, null, null, false],
      ['PHOTO', 'Surcharge Kamera Profesional', 'FLAT', 50, 50, 0, 0, 'OPTIONAL', false, false, null, null, false],
      ['MEDIS', 'Fee Tenaga Medis (sesi 3 jam)', 'FLAT', 500, 500, 0, 0, 'OPTIONAL', false, false, null, null, false]
    ];

    for (const item of catalogItems) {
      await connection.query(
        `INSERT INTO catalog (
          group_name, item_name, basis, rate_standard, rate_maximal, rate_premium, qty_default, scope, is_level_adjusted, is_catering_tier, bellboy_type, depends_on_item, is_active_by_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }
    console.log('Catalog items seeded.');

    // Seed Packages
    console.log('Seeding Default Packages...');
    const defaultPackages = [
      ['BESAR', 'Grup Besar', '16 pax ke atas. Seluruh handling oleh Tim Handling.'],
      ['ESENSIAL', 'Kecil — Esensial', 'Maks 15 pax. Hanya check-in hotel. Sisanya Muthowif & TL.'],
      ['LENGKAP', 'Kecil — Lengkap', 'Maks 15 pax. Seluruh handling oleh Tim Handling.']
    ];

    const packageIds = {};
    for (const pkg of defaultPackages) {
      const [res] = await connection.query(
        'INSERT INTO packages (package_code, package_name, description) VALUES (?, ?, ?)',
        pkg
      );
      packageIds[pkg[0]] = res.insertId;
    }
    console.log('Default Packages seeded.');

    // Link Catalog Items to Packages dynamically based on their scope
    console.log('Linking Catalog Items to Packages...');
    const [dbCatalog] = await connection.query('SELECT id, scope FROM catalog');
    for (const item of dbCatalog) {
      const { id: catalogId, scope } = item;
      if (scope === 'ALL') {
        await connection.query('INSERT INTO package_items (package_id, catalog_id) VALUES (?, ?)', [packageIds.BESAR, catalogId]);
        await connection.query('INSERT INTO package_items (package_id, catalog_id) VALUES (?, ?)', [packageIds.ESENSIAL, catalogId]);
        await connection.query('INSERT INTO package_items (package_id, catalog_id) VALUES (?, ?)', [packageIds.LENGKAP, catalogId]);
      } else if (scope === 'FULL') {
        await connection.query('INSERT INTO package_items (package_id, catalog_id) VALUES (?, ?)', [packageIds.BESAR, catalogId]);
        await connection.query('INSERT INTO package_items (package_id, catalog_id) VALUES (?, ?)', [packageIds.LENGKAP, catalogId]);
      } else if (scope === 'ESN') {
        await connection.query('INSERT INTO package_items (package_id, catalog_id) VALUES (?, ?)', [packageIds.ESENSIAL, catalogId]);
      }
    }
    console.log('Catalog items linked to packages.');

    // Seed Settings
    console.log('Seeding Default Settings...');
    await connection.query(
      'INSERT INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?), (?, ?, ?)',
      [
        'min_margin', '20.00', 'Margin keuntungan target (%) untuk kelayakan otomatis tanpa approval admin',
        'floor_margin', '12.50', 'Batas bawah margin keuntungan (%) untuk kelayakan'
      ]
    );
    console.log('Default Settings seeded.');
    console.log('Database seeding finished successfully!');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await connection.end();
  }
}

seed();
