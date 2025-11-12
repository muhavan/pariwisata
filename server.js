const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require("path")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))
app.use(express.static(path.join(__dirname)))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Database Connection
const mysql = require("mysql2/promise")

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "si_umkm_ekraf",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Test Database Connection
pool
  .getConnection()
  .then((connection) => {
    console.log("MySQL Database Connected Successfully!")
    connection.release()
  })
  .catch((err) => {
    console.error("Database Connection Failed:", err.message)
  })

// Store pool globally
global.db = pool

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/umkm", require("./routes/umkm"))
app.use("/api/wisata", require("./routes/wisata"))
app.use("/api/admin", require("./routes/admin"))
app.use("/api/upload", require("./routes/upload"))
app.use("/api/member", require("./routes/member"))

// Serve static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: err.message,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
