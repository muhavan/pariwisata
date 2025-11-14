-- Add tanggal_lahir column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN tanggal_lahir DATE;

-- Ensure users table has all required columns
ALTER TABLE users MODIFY COLUMN email VARCHAR(100) UNIQUE;
