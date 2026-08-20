-- Database DDL for Kalkulator Lancar Jaya

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin', 'inputer', 'user') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: catalog
CREATE TABLE IF NOT EXISTS catalog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_name VARCHAR(100) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  basis VARCHAR(50) NOT NULL,
  rate_standard DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  rate_maximal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  rate_premium DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Khusus katering premium
  qty_default DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  scope VARCHAR(50) NOT NULL DEFAULT 'ALL',
  is_level_adjusted BOOLEAN NOT NULL DEFAULT FALSE, -- lv: 1
  is_catering_tier BOOLEAN NOT NULL DEFAULT FALSE,   -- tr: 1
  bellboy_type VARCHAR(10) NULL,                     -- bb: 'in' atau 'out'
  depends_on_item VARCHAR(50) NULL,                  -- dep: 'zam' atau id: 'zam'
  is_active_by_default BOOLEAN NOT NULL DEFAULT TRUE,-- on: 1 atau 0
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: packages
CREATE TABLE IF NOT EXISTS packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_code VARCHAR(50) NOT NULL UNIQUE,
  package_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: package_items
CREATE TABLE IF NOT EXISTS package_items (
  package_id INT NOT NULL,
  catalog_id INT NOT NULL,
  PRIMARY KEY (package_id, catalog_id),
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (catalog_id) REFERENCES catalog(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: proposals
CREATE TABLE IF NOT EXISTS proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_number VARCHAR(50) NOT NULL UNIQUE,
  client_name VARCHAR(255) NOT NULL,
  pax_count INT NOT NULL,
  package_type VARCHAR(100) NOT NULL,
  duration_days INT NOT NULL,
  hotel_in INT NOT NULL,
  hotel_out INT NOT NULL,
  catering_class VARCHAR(50) NOT NULL,
  tips_scenario VARCHAR(50) NOT NULL,
  exchange_rate DECIMAL(12,2) NOT NULL DEFAULT 4800.00,
  overhead_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  margin_percent DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  direct_cost DECIMAL(15,2) NOT NULL,
  full_cost DECIMAL(15,2) NOT NULL,
  sell_price DECIMAL(15,2) NOT NULL,
  profit DECIMAL(15,2) NOT NULL,
  details_json LONGTEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL,
  description TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
