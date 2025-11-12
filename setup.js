const initializeDatabase = require("./database/init")

async function setup() {
  console.log("🚀 Starting application setup...\n")

  try {
    const success = await initializeDatabase()

    if (success) {
      console.log("\n✓ Setup completed successfully!")
      console.log("✓ Database db_umkm is ready to use")
    } else {
      console.log("\n✗ Setup failed. Please check your MySQL connection.")
      process.exit(1)
    }
  } catch (error) {
    console.error("Setup error:", error)
    process.exit(1)
  }
}

// Run setup
setup()
