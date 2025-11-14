const express = require("express")
const router = express.Router()

// Get member profile by UMKM ID
router.get("/:umkm_id/profile", async (req, res) => {
  try {
    const { umkm_id } = req.params
    const db = global.db

    const [profile] = await db.execute("SELECT * FROM member_profiles WHERE umkm_id = ?", [umkm_id])

    if (profile.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: "Profil belum dibuat",
      })
    }

    res.json({
      success: true,
      data: profile[0],
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

// Update member profile
router.post("/:umkm_id/profile", async (req, res) => {
  try {
    const { umkm_id } = req.params
    const { full_name, foto_profile } = req.body
    const db = global.db

    // Check if UMKM exists
    const [umkm] = await db.execute("SELECT id FROM umkm WHERE id = ?", [umkm_id])

    if (umkm.length === 0) {
      return res.status(404).json({
        success: false,
        message: "UMKM tidak ditemukan",
      })
    }

    // Check if profile exists
    const [existing] = await db.execute("SELECT id FROM member_profiles WHERE umkm_id = ?", [umkm_id])

    if (existing.length > 0) {
      // Update existing profile
      await db.execute(
        "UPDATE member_profiles SET full_name = ?, foto_profile = ?, updated_at = NOW() WHERE umkm_id = ?",
        [full_name || null, foto_profile || null, umkm_id],
      )
    } else {
      // Create new profile
      await db.execute("INSERT INTO member_profiles (umkm_id, full_name, foto_profile) VALUES (?, ?, ?)", [
        umkm_id,
        full_name || null,
        foto_profile || null,
      ])
    }

    res.json({
      success: true,
      message: "Profil berhasil diperbarui",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    })
  }
})

module.exports = router
