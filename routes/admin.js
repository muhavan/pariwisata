const express = require("express")
const { verifyToken } = require("./auth")
const bcrypt = require("bcryptjs")
const router = express.Router()

// Middleware to verify superadmin role
const verifySuperAdmin = async (req, res, next) => {
  try {
    const db = global.db
    const [rows] = await db.execute("SELECT role FROM admins WHERE id = ?", [req.admin_id])

    if (rows.length === 0 || rows[0].role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Hanya superadmin yang dapat mengakses fitur ini",
      })
    }
    next()
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" })
  }
}

// Get dashboard statistics
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const db = global.db

    const [totalUmkm] = await db.execute('SELECT COUNT(*) as count FROM umkm WHERE status = "approved"')

    const [pendingUmkm] = await db.execute('SELECT COUNT(*) as count FROM umkm WHERE status = "pending"')

    const [approvedUmkm] = await db.execute('SELECT COUNT(*) as count FROM umkm WHERE status = "approved"')

    const [rejectedUmkm] = await db.execute('SELECT COUNT(*) as count FROM umkm WHERE status = "rejected"')

    res.json({
      success: true,
      stats: {
        total_umkm: totalUmkm[0].count,
        pending_umkm: pendingUmkm[0].count,
        approved_umkm: approvedUmkm[0].count,
        rejected_umkm: rejectedUmkm[0].count,
      },
    })
  } catch (error) {
    console.error("Stats error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Get activity logs
router.get("/logs", verifyToken, async (req, res) => {
  try {
    const db = global.db
    const limit = req.query.limit || 10

    const [logs] = await db.execute(
      `
      SELECT al.*, a.username, a.full_name
      FROM activity_logs al
      JOIN admins a ON al.admin_id = a.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `,
      [Number.parseInt(limit)],
    )

    res.json({
      success: true,
      logs: logs,
    })
  } catch (error) {
    console.error("Logs error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Get all admins (superadmin only)
router.get("/list", verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const db = global.db
    const [admins] = await db.execute(
      "SELECT id, username, email, full_name, role, tanggal_lahir, is_active, created_at FROM admins ORDER BY created_at DESC",
    )

    res.json({
      success: true,
      data: admins,
    })
  } catch (error) {
    console.error("Get admins error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Create new admin (superadmin only)
router.post("/create", verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const { full_name, username, password, tanggal_lahir, role } = req.body

    if (!full_name || !username || !password || !tanggal_lahir) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap",
      })
    }

    const db = global.db

    // Check if username already exists
    const [existing] = await db.execute("SELECT id FROM admins WHERE username = ?", [username])
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username sudah terdaftar",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new admin
    const [result] = await db.execute(
      `INSERT INTO admins (username, password, full_name, tanggal_lahir, role, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [username, hashedPassword, full_name, tanggal_lahir, role || "admin"],
    )

    // Log activity
    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "CREATE_ADMIN",
      JSON.stringify({ username, full_name, role: role || "admin" }),
    ])

    res.json({
      success: true,
      message: "Admin berhasil ditambahkan",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Create admin error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Toggle admin status (superadmin only)
router.post("/:id/toggle-status", verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    // Get current status
    const [admin] = await db.execute("SELECT is_active, role FROM admins WHERE id = ?", [id])

    if (admin.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan",
      })
    }

    // Cannot deactivate superadmin
    if (admin[0].role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Tidak dapat mengubah status superadmin",
      })
    }

    const newStatus = !admin[0].is_active

    // Update status
    await db.execute("UPDATE admins SET is_active = ? WHERE id = ?", [newStatus, id])

    // Log activity
    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "TOGGLE_ADMIN_STATUS",
      JSON.stringify({ is_active: newStatus }),
    ])

    res.json({
      success: true,
      message: "Status admin berhasil diubah",
    })
  } catch (error) {
    console.error("Toggle admin status error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Delete admin (superadmin only)
router.delete("/:id", verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    // Check if admin exists and is not superadmin
    const [admin] = await db.execute("SELECT role FROM admins WHERE id = ?", [id])

    if (admin.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan",
      })
    }

    if (admin[0].role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Tidak dapat menghapus superadmin",
      })
    }

    // Delete admin
    await db.execute("DELETE FROM admins WHERE id = ?", [id])

    // Log activity
    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "DELETE_ADMIN",
      JSON.stringify({ status: "deleted" }),
    ])

    res.json({
      success: true,
      message: "Admin berhasil dihapus",
    })
  } catch (error) {
    console.error("Delete admin error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Get all members
router.get("/members", verifyToken, async (req, res) => {
  try {
    const db = global.db
    const [members] = await db.execute(
      `SELECT id, full_name, email, nomor_telepon, tanggal_lahir, created_at,
              CASE WHEN id IN (SELECT pemilik_id FROM umkm WHERE pemilik_id IS NOT NULL) THEN true ELSE false END as has_umkm
       FROM members ORDER BY created_at DESC`,
    )

    res.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error("[v0] Get members error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Get single member detail
router.get("/members/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    const [member] = await db.execute(
      `SELECT id, full_name, email, nomor_telepon, tanggal_lahir, status, 
              foto_profile, created_at, updated_at
       FROM members WHERE id = ?`,
      [id],
    )

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Anggota tidak ditemukan",
      })
    }

    res.json({
      success: true,
      data: member[0],
    })
  } catch (error) {
    console.error("[v0] Get member detail error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Create new member
router.post("/members/create", verifyToken, async (req, res) => {
  try {
    const { full_name, email, nomor_telepon, tanggal_lahir } = req.body

    if (!full_name || !email || !tanggal_lahir) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan tanggal lahir harus diisi",
      })
    }

    const db = global.db
    const bcryptLib = require("bcryptjs")

    // Check if email already exists
    const [existing] = await db.execute("SELECT id FROM members WHERE email = ?", [email])
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      })
    }

    // Password default adalah tanggal lahir format YYYY-MM-DD
    const defaultPassword = tanggal_lahir
    const hashedPassword = await bcryptLib.hash(defaultPassword, 10)

    // Insert new member
    const [result] = await db.execute(
      `INSERT INTO members (full_name, email, nomor_telepon, tanggal_lahir, password, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [full_name, email, nomor_telepon || null, tanggal_lahir, hashedPassword],
    )

    // Log activity
    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "CREATE_MEMBER",
      JSON.stringify({ full_name, email, tanggal_lahir }),
    ])

    res.json({
      success: true,
      message: "Anggota berhasil ditambahkan",
      id: result.insertId,
      defaultPassword: defaultPassword,
    })
  } catch (error) {
    console.error("[v0] Create member error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    })
  }
})

// Delete member
router.delete("/members/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    const [member] = await db.execute("SELECT id FROM members WHERE id = ?", [id])

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Anggota tidak ditemukan",
      })
    }

    // Delete member
    await db.execute("DELETE FROM members WHERE id = ?", [id])

    // Log activity
    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "DELETE_MEMBER",
      JSON.stringify({ member_id: id }),
    ])

    res.json({
      success: true,
      message: "Anggota berhasil dihapus",
    })
  } catch (error) {
    console.error("[v0] Delete member error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

module.exports = router
