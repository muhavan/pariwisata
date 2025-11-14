// ===== DATABASE MANAGEMENT =====
class DatabaseManager {
  constructor() {
    this.admins = this.loadFromStorage("admins") || [
      { id: 1, username: "admin", password: "admin123", nama: "Administrator Tangsel" },
    ]
    this.umkmPengajuan = this.loadFromStorage("umkmPengajuan") || []
    this.umkmData = this.loadFromStorage("umkmData") || this.getDefaultUMKMData()
    this.logs = this.loadFromStorage("logs") || []
  }

  getDefaultUMKMData() {
    return [
      {
        id: 1,
        namaUMKM: "Kopi Tangsel",
        kategori: "Minuman",
        alamat: "Jl. Merdeka No. 10, Ciputat",
        telepon: "0812-3456-7890",
        email: "kopi@tangsel.com",
        status: "Aktif",
        tanggalDisetujui: new Date().toISOString(),
      },
      {
        id: 2,
        namaUMKM: "Batik Tangsel Craft",
        kategori: "Kerajinan",
        alamat: "Jl. Seni No. 5, Pondok Aren",
        telepon: "0821-9876-5432",
        email: "batik@tangsel.com",
        status: "Aktif",
        tanggalDisetujui: new Date().toISOString(),
      },
      {
        id: 3,
        namaUMKM: "Kuliner Nusantara",
        kategori: "Makanan",
        alamat: "Jl. Raya Serpong No. 20",
        telepon: "0813-5555-6666",
        email: "kuliner@tangsel.com",
        status: "Aktif",
        tanggalDisetujui: new Date().toISOString(),
      },
      {
        id: 4,
        namaUMKM: "Fashion Lokal Tangsel",
        kategori: "Fashion",
        alamat: "Jl. Pasar No. 15, Balaraja",
        telepon: "0822-1111-2222",
        email: "fashion@tangsel.com",
        status: "Aktif",
        tanggalDisetujui: new Date().toISOString(),
      },
      {
        id: 5,
        namaUMKM: "Keramik Tradisional",
        kategori: "Keramik",
        alamat: "Jl. Tua No. 30, Ciputat",
        telepon: "0814-3333-4444",
        email: "keramik@tangsel.com",
        status: "Aktif",
        tanggalDisetujui: new Date().toISOString(),
      },
    ]
  }

  loadFromStorage(key) {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }

  saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
  }

  // ===== ADMIN OPERATIONS =====
  loginAdmin(username, password) {
    const admin = this.admins.find((a) => a.username === username && a.password === password)
    if (admin) {
      this.addLog("LOGIN", `Admin ${admin.nama} berhasil login`, "success")
      return { success: true, admin: admin }
    }
    this.addLog("LOGIN", `Gagal login dengan username ${username}`, "failed")
    return { success: false, message: "Username atau password salah" }
  }

  logoutAdmin(adminId) {
    const admin = this.admins.find((a) => a.id === adminId)
    if (admin) {
      this.addLog("LOGOUT", `Admin ${admin.nama} logout`, "success")
      return true
    }
    return false
  }

  // ===== PENGAJUAN UMKM OPERATIONS =====
  submitUMKMApplication(data) {
    const id = this.umkmPengajuan.length + 1
    const application = {
      id: id,
      namaUMKM: data.namaUMKM,
      kategori: data.kategori,
      alamat: data.alamat,
      telepon: data.telepon,
      email: data.email || "",
      foto: data.foto || "placeholder.jpg",
      status: "pending",
      tanggalPengajuan: new Date().toISOString(),
      alasanPenolakan: null,
    }
    this.umkmPengajuan.push(application)
    this.saveToStorage("umkmPengajuan", this.umkmPengajuan)
    this.addLog("PENGAJUAN", `UMKM "${data.namaUMKM}" mengajukan pendaftaran`, "success")
    return application
  }

  getPengajuanList() {
    return this.umkmPengajuan
  }

  getPengajuanById(id) {
    return this.umkmPengajuan.find((p) => p.id === id)
  }

  approveUMKM(pengajuanId, adminId) {
    const pengajuan = this.umkmPengajuan.find((p) => p.id === pengajuanId)
    const admin = this.admins.find((a) => a.id === adminId)

    if (pengajuan && admin) {
      pengajuan.status = "approved"

      // Move to umkmData
      const umkmItem = {
        id: this.umkmData.length + 1,
        namaUMKM: pengajuan.namaUMKM,
        kategori: pengajuan.kategori,
        alamat: pengajuan.alamat,
        telepon: pengajuan.telepon,
        email: pengajuan.email,
        foto: pengajuan.foto,
        status: "Aktif",
        tanggalDisetujui: new Date().toISOString(),
      }

      this.umkmData.push(umkmItem)
      this.saveToStorage("umkmPengajuan", this.umkmPengajuan)
      this.saveToStorage("umkmData", this.umkmData)

      this.addLog("APPROVAL", `${admin.nama} menyetujui UMKM "${pengajuan.namaUMKM}"`, "success")
      return true
    }
    return false
  }

  rejectUMKM(pengajuanId, alasan, adminId) {
    const pengajuan = this.umkmPengajuan.find((p) => p.id === pengajuanId)
    const admin = this.admins.find((a) => a.id === adminId)

    if (pengajuan && admin) {
      pengajuan.status = "rejected"
      pengajuan.alasanPenolakan = alasan
      this.saveToStorage("umkmPengajuan", this.umkmPengajuan)
      this.addLog("REJECTION", `${admin.nama} menolak UMKM "${pengajuan.namaUMKM}": ${alasan}`, "warning")
      return true
    }
    return false
  }

  // ===== DATA UMKM OPERATIONS =====
  getUMKMList() {
    return this.umkmData
  }

  deleteUMKM(umkmId, adminId) {
    const admin = this.admins.find((a) => a.id === adminId)
    const umkm = this.umkmData.find((u) => u.id === umkmId)

    if (umkm && admin) {
      this.umkmData = this.umkmData.filter((u) => u.id !== umkmId)
      this.saveToStorage("umkmData", this.umkmData)
      this.addLog("DELETE", `${admin.nama} menghapus UMKM "${umkm.namaUMKM}"`, "warning")
      return true
    }
    return false
  }

  // ===== LOG OPERATIONS =====
  addLog(tipe, keterangan, status) {
    const log = {
      id: this.logs.length + 1,
      tipe: tipe,
      keterangan: keterangan,
      status: status,
      waktu: new Date().toLocaleString("id-ID"),
    }
    this.logs.push(log)
    this.saveToStorage("logs", this.logs)
  }

  getLogs() {
    return this.logs.reverse()
  }

  getLogsByType(tipe) {
    return this.logs.filter((l) => l.tipe === tipe).reverse()
  }
}

// ===== GLOBAL DATABASE INSTANCE =====
const db = new DatabaseManager()

// ===== SESSION MANAGEMENT =====
class SessionManager {
  static setSession(admin) {
    sessionStorage.setItem("admin", JSON.stringify(admin))
  }

  static getSession() {
    const admin = sessionStorage.getItem("admin")
    return admin ? JSON.parse(admin) : null
  }

  static clearSession() {
    sessionStorage.removeItem("admin")
  }

  static isLoggedIn() {
    return this.getSession() !== null
  }
}

// ===== HELPER FUNCTIONS =====
function redirectToLogin() {
  window.location.href = "login.html"
}

function redirectToDashboard() {
  window.location.href = "admin/dashboard.html"
}
