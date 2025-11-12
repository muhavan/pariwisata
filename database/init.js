const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

async function initializeDatabase() {
  let connection

  try {
    // First, connect to MySQL without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    })

    console.log("✓ Connected to MySQL Server")

    await connection.query("CREATE DATABASE IF NOT EXISTS db_umkm")
    console.log("✓ Created database: db_umkm")

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, "schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Split and execute each statement
    const statements = schema.split(";").filter((stmt) => stmt.trim())

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement)
        console.log("✓ Executed:", statement.substring(0, 50) + "...")
      }
    }

    console.log("✓ Database db_umkm initialized successfully!")
    await connection.end()

    return true
  } catch (error) {
    console.error("✗ Database initialization failed:", error.message)
    if (connection) await connection.end()
    return false
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = initializeDatabase
