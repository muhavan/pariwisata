const express = require("express")
const { verifyToken } = require("./auth")
const router = express.Router()

// Get all berita (public) - with limit support for homepage
router.get("/", async (req, res) => {
  try {
    const db = global.db
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : null

    let query = "SELECT * FROM berita ORDER BY created_at DESC"

    if (limit) {
      query += ` LIMIT ${limit}`
    }

    const [berita] = await db.execute(query)

    res.json({
      success: true,
      data: berita,
    })
  } catch (error) {
    console.error("Get berita error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Get single berita by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    const [berita] = await db.execute("SELECT * FROM berita WHERE id = ?", [id])

    if (berita.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      })
    }

    res.json({
      success: true,
      data: berita[0],
    })
  } catch (error) {
    console.error("Get berita detail error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Add berita (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { judul, konten, foto_url } = req.body

    if (!judul || !konten) {
      return res.status(400).json({
        success: false,
        message: "Judul dan konten tidak boleh kosong",
      })
    }

    const db = global.db

    const [result] = await db.execute(
      `INSERT INTO berita (judul, konten, foto_url, created_at)
       VALUES (?, ?, ?, NOW())`,
      [judul, konten, foto_url || null],
    )

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "ADD_BERITA",
      JSON.stringify({ berita_id: result.insertId, judul: judul }),
    ])

    res.json({
      success: true,
      message: "Berita berhasil ditambahkan",
      id: result.insertId,
    })
  } catch (error) {
    console.error("Add berita error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    })
  }
})

// Update berita (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { judul, konten, foto_url } = req.body
    const db = global.db

    const [result] = await db.execute(`UPDATE berita SET judul = ?, konten = ?, foto_url = ? WHERE id = ?`, [
      judul,
      konten,
      foto_url || null,
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      })
    }

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "UPDATE_BERITA",
      JSON.stringify({ berita_id: id, judul: judul }),
    ])

    res.json({
      success: true,
      message: "Berita berhasil diperbarui",
    })
  } catch (error) {
    console.error("Update berita error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Delete berita (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    const [result] = await db.execute("DELETE FROM berita WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      })
    }

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "DELETE_BERITA",
      JSON.stringify({ berita_id: id, status: "deleted" }),
    ])

    res.json({
      success: true,
      message: "Berita berhasil dihapus",
    })
  } catch (error) {
    console.error("Delete berita error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    })
  }
})

module.exports = router
