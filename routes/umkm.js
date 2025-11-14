const express = require("express")
const { verifyToken } = require("./auth")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const db = global.db
    const category = req.query.category
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : null

    let query = 'SELECT * FROM umkm WHERE status = "approved"'
    const params = []

    if (category) {
      query += " AND kategori_usaha = ?"
      params.push(category)
    }

    query += " ORDER BY created_at DESC"

    if (limit) {
      query += ` LIMIT ${limit}`
    }

    const [umkm] = await db.execute(query, params)

    res.json({
      success: true,
      data: umkm,
    })
  } catch (error) {
    console.error("Get UMKM error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

router.get("/pending", verifyToken, async (req, res) => {
  try {
    const db = global.db

    const [umkm] = await db.execute(`
      SELECT u.*, sp.photo_url
      FROM umkm u
      LEFT JOIN submission_photos sp ON u.id = sp.umkm_id
      WHERE u.status = "pending"
      ORDER BY u.created_at DESC
    `)

    res.json({
      success: true,
      data: umkm,
    })
  } catch (error) {
    console.error("Get pending UMKM error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

router.post("/submit", async (req, res) => {
  try {
    const { nama_umkm, kategori_usaha, alamat, nomor_telepon, email, foto_url, status } = req.body

    if (!nama_umkm || !kategori_usaha || !alamat || !nomor_telepon) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap",
      })
    }

    const db = global.db

    const [result] = await db.execute(
      `INSERT INTO umkm (nama_umkm, kategori_usaha, alamat, nomor_telepon, email, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nama_umkm, kategori_usaha, alamat, nomor_telepon, email || null, status || "pending"],
    )

    // Store submission photo separately if provided
    if (result.insertId && foto_url) {
      await db.execute("INSERT INTO submission_photos (umkm_id, photo_url) VALUES (?, ?)", [result.insertId, foto_url])
    }

    res.json({
      success: true,
      message: "Pengajuan UMKM berhasil dikirim",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Submit UMKM error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

router.post("/:id/approve", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    // Get the UMKM with submission photo
    const [umkm] = await db.execute(
      `SELECT u.*, sp.photo_url 
       FROM umkm u 
       LEFT JOIN submission_photos sp ON u.id = sp.umkm_id 
       WHERE u.id = ?`,
      [id],
    )

    if (umkm.length === 0) {
      return res.status(404).json({
        success: false,
        message: "UMKM tidak ditemukan",
      })
    }

    // Update status and set foto_url from submission_photos
    const [result] = await db.execute(
      `UPDATE umkm SET status = "approved", foto_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [umkm[0].photo_url || null, id],
    )

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "APPROVE_UMKM",
      JSON.stringify({ umkm_id: id, status: "approved" }),
    ])

    res.json({
      success: true,
      message: "UMKM berhasil disetujui",
    })
  } catch (error) {
    console.error("Approve UMKM error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

router.post("/:id/reject", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const db = global.db

    const [result] = await db.execute(
      `UPDATE umkm SET status = "rejected", rejection_reason = ?
       WHERE id = ?`,
      [reason || null, id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "UMKM tidak ditemukan",
      })
    }

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "REJECT_UMKM",
      JSON.stringify({ umkm_id: id, status: "rejected", reason: reason }),
    ])

    res.json({
      success: true,
      message: "UMKM berhasil ditolak",
    })
  } catch (error) {
    console.error("Reject UMKM error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    const [result] = await db.execute("DELETE FROM umkm WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "UMKM tidak ditemukan",
      })
    }

    // Also delete associated submission photos
    await db.execute("DELETE FROM submission_photos WHERE umkm_id = ?", [id])

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "DELETE_UMKM",
      JSON.stringify({ umkm_id: id, status: "deleted" }),
    ])

    res.json({
      success: true,
      message: "UMKM berhasil dihapus",
    })
  } catch (error) {
    console.error("Delete UMKM error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

router.get("/:id/submission-photos", async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    const [photos] = await db.execute(
      "SELECT id, photo_url, uploaded_at FROM submission_photos WHERE umkm_id = ? ORDER BY uploaded_at DESC",
      [id],
    )

    res.json({
      success: true,
      data: photos,
    })
  } catch (error) {
    console.error("Get submission photos error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

module.exports = router
