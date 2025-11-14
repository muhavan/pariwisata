-- Rename submission photo table for clarity
ALTER TABLE umkm_submission_photos RENAME TO submission_photos;

-- Ensure UMKM table does NOT store submission photos
ALTER TABLE umkm DROP COLUMN IF EXISTS foto_url;

-- Verify structure - submission_photos table stores photos separately
-- This ensures photos from submission forms don't contaminate UMKM admin data
CREATE TABLE IF NOT EXISTS submission_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  umkm_id INT NOT NULL,
  photo_url VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(umkm_id),
  FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);

-- Member profile photos are stored separately
CREATE TABLE IF NOT EXISTS member_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  umkm_id INT NOT NULL,
  full_name VARCHAR(100),
  foto_profile VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_umkm (umkm_id),
  FOREIGN KEY (umkm_id) REFERENCES umkm(id) ON DELETE CASCADE
);
