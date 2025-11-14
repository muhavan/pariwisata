const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
require("dotenv").config()

async function setupAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "db_umkm", // updated database name to db_umkm
  })

  try {
    // Hash password "admin123"
    const hashedPassword = await bcrypt.hash("admin123", 10)
    console.log("[v0] Hashed password generated")

    // Update existing admin or insert if not exists
    await connection.execute(
      "INSERT INTO admins (username, password, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE password = ?, is_active = 1",
      ["admin", hashedPassword, "admin@siukm.local", "Admin Master", "superadmin", hashedPassword],
    )
    console.log("✅ Admin user setup successfully")

    console.log("\n📝 Login Credentials:")
    console.log("Username: admin")
    console.log("Password: admin123")

    await connection.end()
  } catch (error) {
    console.error("❌ Setup error:", error.message)
    process.exit(1)
  }
}

setupAdmin()
