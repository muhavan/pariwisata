-- Add new columns to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS tanggal_lahir DATE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS foto_profile VARCHAR(255);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_by INT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add new table for submission photos (separate from UMKM data)
CREATE TABLE IF NOT EXISTS umkm_submission_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  umkm_id INT NOT NULL,
  foto_url VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(umkm_id),
  FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);

-- Add new table for member profiles
CREATE TABLE IF NOT EXISTS member_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  umkm_id INT NOT NULL,
  full_name VARCHAR(100),
  foto_profile VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(umkm_id),
  FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);

-- Update activity_logs to track more details
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS target_type VARCHAR(50);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS target_id INT;
ALTER TABLE activity_logs MODIFY COLUMN details JSON NULL;
