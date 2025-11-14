const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const router = express.Router()

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key")
    req.admin_id = decoded.id
    req.username = decoded.username
    req.role = decoded.role
    next()
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid token" })
  }
}

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password harus diisi",
      })
    }

    const db = global.db
    const [rows] = await db.execute("SELECT * FROM admins WHERE username = ?", [username])

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      })
    }

    const admin = rows[0]
    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      })
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: "Akun Anda tidak aktif",
      })
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "24h" },
    )

    // Log activity
    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      admin.id,
      "LOGIN",
      JSON.stringify({ timestamp: new Date() }),
    ])

    res.json({
      success: true,
      message: "Login berhasil",
      token: token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Get current admin info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const db = global.db
    const [rows] = await db.execute(
      "SELECT id, username, email, full_name, role, date_of_birth FROM admins WHERE id = ?",
      [req.admin_id],
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan",
      })
    }

    res.json({
      success: true,
      admin: rows[0],
    })
  } catch (error) {
    console.error("Get admin error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Logout endpoint
router.post("/logout", verifyToken, async (req, res) => {
  try {
    const db = global.db

    // Log activity
    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "LOGOUT",
      JSON.stringify({ timestamp: new Date() }),
    ])

    res.json({
      success: true,
      message: "Logout berhasil",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

module.exports = router
module.exports.verifyToken = verifyToken
