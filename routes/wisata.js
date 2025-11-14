const express = require("express")
const { verifyToken } = require("./auth")
const router = express.Router()

// Get all destinasi wisata (public) - Add limit support
router.get("/", async (req, res) => {
  try {
    const db = global.db
    const category = req.query.kategori
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : null

    let query = "SELECT * FROM destinasi_wisata"
    const params = []

    if (category) {
      query += " WHERE kategori = ?"
      params.push(category)
    }

    query += " ORDER BY created_at DESC"

    if (limit) {
      query += ` LIMIT ${limit}`
    }

    const [wisata] = await db.execute(query, params)

    res.json({
      success: true,
      data: wisata,
    })
  } catch (error) {
    console.error("Get wisata error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Get single destinasi wisata
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    const [wisata] = await db.execute("SELECT * FROM destinasi_wisata WHERE id = ?", [id])

    if (wisata.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Destinasi wisata tidak ditemukan",
      })
    }

    res.json({
      success: true,
      data: wisata[0],
    })
  } catch (error) {
    console.error("Get wisata detail error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Add destinasi wisata (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      nama_destinasi,
      deskripsi,
      alamat,
      kategori,
      foto_url,
      latitude,
      longitude,
      nomor_telepon,
      email,
      jam_buka,
      jam_tutup,
    } = req.body

    console.log("[v0] POST /api/wisata received:", req.body)

    if (!nama_destinasi || !alamat) {
      return res.status(400).json({
        success: false,
        message: "Nama destinasi dan alamat tidak boleh kosong",
      })
    }

    const db = global.db

    const [result] = await db.execute(
      `INSERT INTO destinasi_wisata 
       (nama_destinasi, deskripsi, alamat, kategori, foto_url, latitude, longitude, nomor_telepon, email, jam_buka, jam_tutup)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama_destinasi,
        deskripsi || null,
        alamat,
        kategori || null,
        foto_url || null,
        latitude || null,
        longitude || null,
        nomor_telepon || null,
        email || null,
        jam_buka || null,
        jam_tutup || null,
      ],
    )

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "ADD_WISATA",
      JSON.stringify({ wisata_id: result.insertId, nama: nama_destinasi }),
    ])

    res.json({
      success: true,
      message: "Destinasi wisata berhasil ditambahkan",
      id: result.insertId,
    })
  } catch (error) {
    console.error("[v0] Add wisata error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    })
  }
})

// Update destinasi wisata (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const db = global.db

    // Build dynamic update query
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(updates)
    values.push(id)

    const [result] = await db.execute(`UPDATE destinasi_wisata SET ${fields} WHERE id = ?`, values)

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Destinasi wisata tidak ditemukan",
      })
    }

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "UPDATE_WISATA",
      JSON.stringify({ wisata_id: id, updates: updates }),
    ])

    res.json({
      success: true,
      message: "Destinasi wisata berhasil diperbarui",
    })
  } catch (error) {
    console.error("Update wisata error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Delete destinasi wisata (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const db = global.db

    const [result] = await db.execute("DELETE FROM destinasi_wisata WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Destinasi wisata tidak ditemukan",
      })
    }

    await db.execute("INSERT INTO activity_logs (admin_id, action, details) VALUES (?, ?, ?)", [
      req.admin_id,
      "DELETE_WISATA",
      JSON.stringify({ wisata_id: id, status: "deleted" }),
    ])

    res.json({
      success: true,
      message: "Destinasi wisata berhasil dihapus",
    })
  } catch (error) {
    console.error("Delete wisata error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + error.message,
    })
  }
})

module.exports = router
