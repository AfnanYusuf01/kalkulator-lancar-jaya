CREATE DATABASE IF NOT EXISTS kalkulator_lancar_jaya;
CREATE USER IF NOT EXISTS 'lancar_jaya'@'localhost' IDENTIFIED BY 'lancar_jaya_password';
GRANT ALL PRIVILEGES ON kalkulator_lancar_jaya.* TO 'lancar_jaya'@'localhost';
FLUSH PRIVILEGES;
