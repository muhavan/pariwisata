const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { verifyToken } = require("./auth")
const router = express.Router()

// Setup multer for file uploads
const uploadsDir = path.join(__dirname, "../uploads")

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("File type tidak didukung. Gunakan JPG, PNG, GIF, atau WebP"))
    }
  },
})

// Upload single file (public)
router.post("/single", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan",
      })
    }

    const fileUrl = `/uploads/${req.file.filename}`

    res.json({
      success: true,
      message: "File berhasil diunggah",
      url: fileUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat upload",
    })
  }
})

// Upload multiple files (admin)
router.post("/multiple", verifyToken, upload.array("files", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "File tidak ditemukan",
      })
    }

    const urls = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    }))

    res.json({
      success: true,
      message: "File berhasil diunggah",
      files: urls,
    })
  } catch (error) {
    console.error("Multiple upload error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat upload",
    })
  }
})

module.exports = router
