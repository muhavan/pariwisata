CREATE DATABASE IF NOT EXISTS db_umkm;
USE db_umkm;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  full_name VARCHAR(100),
  tanggal_lahir DATE,
  role ENUM('admin', 'superadmin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(username)
);

-- Added foto_url to umkm table for consistency
CREATE TABLE IF NOT EXISTS umkm (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_umkm VARCHAR(150) NOT NULL,
  kategori_usaha VARCHAR(100) NOT NULL,
  alamat TEXT NOT NULL,
  nomor_telepon VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  foto_url VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  pemilik_id INT,
  INDEX(status),
  FOREIGN KEY (pemilik_id) REFERENCES members(id) ON DELETE SET NULL
);

-- Added latitude, longitude, harga_tiket to destinasi_wisata
CREATE TABLE IF NOT EXISTS destinasi_wisata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_destinasi VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  alamat TEXT NOT NULL,
  kategori VARCHAR(50),
  foto_url VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  nomor_telepon VARCHAR(15),
  email VARCHAR(100),
  jam_buka VARCHAR(50),
  jam_tutup VARCHAR(50),
  harga_tiket INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(kategori)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(admin_id),
  INDEX(created_at)
);

-- Added members table with proper fields
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nomor_telepon VARCHAR(15),
  tanggal_lahir DATE,
  foto_profile VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(email),
  INDEX(status)
);

-- Added submission_photos table for UMKM submission photos
CREATE TABLE IF NOT EXISTS submission_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  umkm_id INT NOT NULL,
  photo_url VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(umkm_id),
  FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);

-- Added member_profiles table for member profile data
CREATE TABLE IF NOT EXISTS member_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  umkm_id INT NOT NULL,
  full_name VARCHAR(100),
  foto_profile VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_umkm (umkm_id),
  FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);

INSERT INTO admins (username, password, email, full_name) 
VALUES ('admin', '$2a$10$3E8I7H2ZxF4r1K9pL5mO6.dWpJ8xH2Z3Y1A5B6C7D8E9F0G1H2I3J', 'admin@siukm.local', 'Admin Master')
ON DUPLICATE KEY UPDATE id=id;
