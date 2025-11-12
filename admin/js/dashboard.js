// Check if user is logged in
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken")
  const adminData = localStorage.getItem("adminData")

  if (!token || !adminData) {
    window.location.href = "../login.html"
    return
  }

  const admin = JSON.parse(adminData)
  localStorage.setItem("adminId", admin.id)

  const adminNameEl = document.getElementById("admin-name")
  if (adminNameEl) adminNameEl.textContent = admin.full_name || admin.username

  const adminMenuItem = document.getElementById("admin-menu-item")
  if (adminMenuItem && admin.role === "superadmin") {
    adminMenuItem.style.display = "flex"
  }

  setupEventListeners()

  initializeDashboard(admin)
  updateClock()
  setInterval(updateClock, 1000)
})

function setupEventListeners() {
  // Tab switching listeners
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      const tabName = this.getAttribute("data-tab")
      window.switchTab(tabName)
    })
  })

  // Logout button
  const logoutBtn = document.getElementById("btn-logout")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", window.logoutAdmin)
  }

  // Add UMKM button
  const addUmkmBtn = document.getElementById("btn-tambah-umkm")
  if (addUmkmBtn) {
    addUmkmBtn.addEventListener("click", showAddUMKMForm)
  }

  // Add Destinasi button
  const addDestBtn = document.getElementById("btn-tambah-destinasi")
  if (addDestBtn) {
    addDestBtn.addEventListener("click", showAddDestinasiFull)
  }

  const addMemberBtn = document.getElementById("btn-tambah-anggota")
  if (addMemberBtn) {
    addMemberBtn.addEventListener("click", showAddMemberForm)
  }

  const addAdminBtn = document.getElementById("btn-tambah-admin")
  if (addAdminBtn) {
    addAdminBtn.addEventListener("click", showAddAdminForm)
  }

  // Modal close button
  const modalClose = document.getElementById("modal-close")
  if (modalClose) {
    modalClose.addEventListener("click", window.closePengajuanModal)
  }
}

function initializeDashboard(admin) {
  document.getElementById("admin-name").textContent = admin.full_name || admin.username
  loadDashboardStats()
  loadActivityList()
  loadUMKMTable()
  loadPengajuanList()
  loadLogsList()
  loadDestinationList()
  loadMemberList()

  if (admin.role === "superadmin") {
    loadAdminList()
  }
}

function setupAdminManagement() {
  // Placeholder for admin management setup
  console.log("Admin management setup")
}

function updateClock() {
  const now = new Date()
  const time = now.toLocaleTimeString("id-ID")
  document.getElementById("current-time").textContent = time
}

// ===== DASHBOARD STATS =====
async function loadDashboardStats() {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch("http://localhost:5000/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (data.success) {
      document.getElementById("total-umkm").textContent = data.stats.total_umkm || 0
      document.getElementById("total-pengajuan").textContent = data.stats.pending_umkm || 0
      document.getElementById("total-approved").textContent = data.stats.approved_umkm || 0
      document.getElementById("total-rejected").textContent = data.stats.rejected_umkm || 0
    }
  } catch (error) {
    console.error("Error loading stats:", error)
  }
}

// ===== ACTIVITY LIST =====
async function loadActivityList() {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch("http://localhost:5000/api/admin/logs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    const activityList = document.getElementById("activity-list")

    if (data.success && data.logs.length > 0) {
      activityList.innerHTML = data.logs
        .slice(0, 10)
        .map(
          (log) => `
          <div class="activity-item">
            <p class="activity-time">${new Date(log.created_at).toLocaleString("id-ID")}</p>
            <p class="activity-text"><strong>${log.action}:</strong> ${log.details}</p>
            <span class="activity-status success">SUCCESS</span>
          </div>
        `,
        )
        .join("")
    } else {
      activityList.innerHTML = '<p style="text-align: center; color: #9ca3af;">Tidak ada aktivitas</p>'
    }
  } catch (error) {
    console.error("Error loading activity:", error)
  }
}

// ===== TAB SWITCHING =====
window.switchTab = (tabName) => {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Remove active class from all menu items
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Show selected tab
  const selectedTab = document.getElementById(tabName)
  if (selectedTab) {
    selectedTab.classList.add("active")
  }

  // Update page title
  const titles = {
    dashboard: "Dashboard",
    "data-umkm": "Data UMKM",
    pengajuan: "Pengajuan UMKM",
    destinasi: "Data Wisata",
    "kelola-anggota": "Kelola Anggota",
    laporan: "Laporan & Log",
    "admin-management": "Kelola Admin",
  }
  document.getElementById("page-title").textContent = titles[tabName] || "Dashboard"

  // Load content for each tab
  if (tabName === "data-umkm") {
    loadUMKMTable()
  } else if (tabName === "pengajuan") {
    loadPengajuanList()
  } else if (tabName === "laporan") {
    loadLogsList()
  } else if (tabName === "destinasi") {
    loadDestinationList()
  } else if (tabName === "kelola-anggota") {
    loadMemberList()
  } else if (tabName === "admin-management") {
    loadAdminList()
  }
}

// ===== UMKM TABLE =====
async function loadUMKMTable() {
  try {
    const token = localStorage.getItem("authToken")

    const response = await fetch("http://localhost:5000/api/umkm", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    const tableBody = document.getElementById("umkm-table-body")

    if (data.success && data.data && data.data.length > 0) {
      tableBody.innerHTML = data.data
        .map(
          (umkm, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${umkm.nama_umkm}</strong></td>
          <td>${umkm.kategori_usaha}</td>
          <td>${umkm.alamat}</td>
          <td>${umkm.nomor_telepon}</td>
          <td><span class="status-badge aktif">${umkm.status || "approved"}</span></td>
          <td><button class="btn btn-delete btn-small" data-delete-id="${umkm.id}">Hapus</button></td>
        </tr>
      `,
        )
        .join("")

      document.querySelectorAll("[data-delete-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          deleteUMKM(this.getAttribute("data-delete-id"))
        })
      })
    } else {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #9ca3af;">Data UMKM kosong</td></tr>'
    }
  } catch (error) {
    console.error("Error loading UMKM table:", error)
    document.getElementById("umkm-table-body").innerHTML =
      '<tr><td colspan="7" style="text-align: center; color: #9ca3af;">Error memuat data</td></tr>'
  }
}

async function deleteUMKM(umkmId) {
  if (confirm("Apakah Anda yakin ingin menghapus UMKM ini?")) {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:5000/api/umkm/${umkmId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        loadDashboardStats()
        loadActivityList()
        loadUMKMTable()
        alert("UMKM berhasil dihapus")
      } else {
        alert("Gagal menghapus UMKM: " + data.message)
      }
    } catch (error) {
      console.error("Error deleting UMKM:", error)
      alert("Error menghapus UMKM: " + error.message)
    }
  }
}

// ===== PENGAJUAN LIST =====
async function loadPengajuanList() {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch("http://localhost:5000/api/umkm/pending", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    const pengajuanDiv = document.getElementById("pengajuan-list")

    if (data.success && data.data && data.data.length > 0) {
      pengajuanDiv.innerHTML = data.data
        .map(
          (pengajuan) => `
        <div class="pengajuan-card">
          <div class="pengajuan-image">${pengajuan.foto_url ? `<img src="${pengajuan.foto_url}" alt="${pengajuan.nama_umkm}" style="width:100%; height:150px; object-fit:cover;">` : "📸 " + pengajuan.nama_umkm}</div>
          <div class="pengajuan-body">
            <h3>${pengajuan.nama_umkm}</h3>
            <div class="pengajuan-info">
              <div><strong>Kategori:</strong> ${pengajuan.kategori_usaha}</div>
              <div><strong>Alamat:</strong> ${pengajuan.alamat}</div>
              <div><strong>Telepon:</strong> ${pengajuan.nomor_telepon}</div>
              <div><strong>Email:</strong> ${pengajuan.email || "-"}</div>
              <div><strong>Tanggal:</strong> ${new Date(pengajuan.created_at).toLocaleDateString("id-ID")}</div>
            </div>
            <div class="pengajuan-actions">
              <button class="btn btn-approve btn-small" data-approve-id="${pengajuan.id}">Setujui</button>
              <button class="btn btn-reject btn-small" data-reject-id="${pengajuan.id}">Tolak</button>
            </div>
          </div>
        </div>
      `,
        )
        .join("")

      document.querySelectorAll("[data-approve-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          approvePengajuan(this.getAttribute("data-approve-id"))
        })
      })

      document.querySelectorAll("[data-reject-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          rejectPengajuanModal(this.getAttribute("data-reject-id"))
        })
      })
    } else {
      pengajuanDiv.innerHTML =
        '<p style="text-align: center; color: #9ca3af; grid-column: 1/-1;">Tidak ada pengajuan baru</p>'
    }
  } catch (error) {
    console.error("Error loading pengajuan:", error)
    document.getElementById("pengajuan-list").innerHTML =
      '<p style="text-align: center; color: #9ca3af; grid-column: 1/-1;">Error memuat data</p>'
  }
}

async function approvePengajuan(pengajuanId) {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch(`http://localhost:5000/api/umkm/${pengajuanId}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.success) {
      loadDashboardStats()
      loadActivityList()
      loadPengajuanList()
      loadUMKMTable()
      alert("UMKM berhasil disetujui!")
    } else {
      alert("Gagal menyetujui UMKM: " + (data.message || "Terjadi kesalahan tidak diketahui"))
    }
  } catch (error) {
    console.error("Error approving pengajuan:", error)
    alert("Error menyetujui UMKM: " + error.message)
  }
}

async function rejectPengajuanModal(pengajuanId) {
  const alasan = prompt("Masukkan alasan penolakan:")
  if (alasan && alasan.trim()) {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:5000/api/umkm/${pengajuanId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: alasan }),
      })

      const data = await response.json()

      if (data.success) {
        loadDashboardStats()
        loadActivityList()
        loadPengajuanList()
        alert("Pengajuan berhasil ditolak")
      } else {
        alert("Gagal menolak pengajuan: " + data.message)
      }
    } catch (error) {
      console.error("Error rejecting pengajuan:", error)
      alert("Error menolak pengajuan")
    }
  }
}

// ===== LOGS TABLE =====
async function loadLogsList() {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch("http://localhost:5000/api/admin/logs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    const tableBody = document.getElementById("logs-table-body")

    if (data.success && data.logs.length > 0) {
      tableBody.innerHTML = data.logs
        .slice(0, 50)
        .map(
          (log, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${log.action}</strong></td>
          <td>${log.details}</td>
          <td><span class="activity-status success">SUCCESS</span></td>
          <td>${new Date(log.created_at).toLocaleString("id-ID")}</td>
        </tr>
      `,
        )
        .join("")
    } else {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">Log kosong</td></tr>'
    }
  } catch (error) {
    console.error("Error loading logs:", error)
    document.getElementById("logs-table-body").innerHTML =
      '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">Error memuat data</td></tr>'
  }
}

// ===== DESTINASI WISATA =====
async function loadDestinationList() {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch("http://localhost:5000/api/wisata", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    const destinasiList = document.getElementById("destinasi-list")

    if (data.success && data.data.length > 0) {
      destinasiList.innerHTML = data.data
        .map(
          (wisata) => `
        <div class="destinasi-card">
          <div class="destinasi-image">${wisata.foto_url ? `<img src="${wisata.foto_url}" alt="${wisata.nama_destinasi}" style="width:100%; height:150px; object-fit:cover;">` : "📍 " + wisata.nama_destinasi}</div>
          <div class="destinasi-info">
            <h3>${wisata.nama_destinasi}</h3>
            <p><strong>Kategori:</strong> ${wisata.kategori || "-"}</p>
            <p><strong>Alamat:</strong> ${wisata.alamat}</p>
            <p><strong>Telepon:</strong> ${wisata.nomor_telepon || "-"}</p>
            <p><strong>Jam Buka:</strong> ${wisata.jam_buka || "-"} - ${wisata.jam_tutup || "-"}</p>
            <p><strong>Harga Tiket:</strong> Rp ${Number.parseInt(wisata.harga_tiket || 0).toLocaleString("id-ID")}</p>
            <div class="destinasi-actions">
              <button class="btn btn-edit btn-small" data-edit-id="${wisata.id}">Edit</button>
              <button class="btn btn-delete btn-small" data-delete-id="${wisata.id}">Hapus</button>
            </div>
          </div>
        </div>
      `,
        )
        .join("")

      document.querySelectorAll("[data-edit-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          editDestinasi(this.getAttribute("data-edit-id"))
        })
      })

      document.querySelectorAll("[data-delete-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          deleteDestinasi(this.getAttribute("data-delete-id"))
        })
      })
    } else {
      destinasiList.innerHTML =
        '<p style="text-align: center; color: #9ca3af; grid-column: 1/-1;">Tidak ada destinasi wisata</p>'
    }
  } catch (error) {
    console.error("Error loading destinasi:", error)
    document.getElementById("destinasi-list").innerHTML =
      '<p style="text-align: center; color: #9ca3af; grid-column: 1/-1;">Error memuat data</p>'
  }
}

async function deleteDestinasi(wisataId) {
  if (confirm("Apakah Anda yakin ingin menghapus destinasi ini?")) {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:5000/api/wisata/${wisataId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        loadActivityList()
        loadDestinationList()
        alert("Destinasi wisata berhasil dihapus")
      } else {
        alert("Gagal menghapus destinasi: " + data.message)
      }
    } catch (error) {
      console.error("Error deleting destinasi:", error)
      alert("Error menghapus destinasi")
    }
  }
}

function editDestinasi(wisataId) {
  alert("Fitur edit destinasi akan diimplementasikan di versi selanjutnya")
}

// ===== ADD UMKM MODAL =====
function toggleAddUMKM() {
  const modal = document.getElementById("add-umkm-modal")
  if (modal) {
    modal.style.display = modal.style.display === "block" ? "none" : "block"
  } else {
    // Create modal if it doesn't exist
    showAddUMKMForm()
  }
}

function showAddUMKMForm() {
  const modalHTML = `
    <div class="form-modal-overlay active" id="formModalOverlay">
      <div class="form-modal">
        <div class="form-header">
          <h3><i class="fas fa-store"></i> Tambah UMKM</h3>
          <button class="form-close-btn" onclick="closeFormModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="form-body" id="formAddUMKM" onsubmit="submitAddUMKM(event)">
          <div class="form-section">
            <div class="form-section-title">Informasi Dasar</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Nama UMKM <span>*</span></label>
                <input type="text" id="umkmNama" placeholder="Masukkan nama UMKM..." required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Kategori Usaha <span>*</span></label>
                <select id="umkmKategori" required>
                  <option value="">Pilih Kategori</option>
                  <option value="Makanan">Makanan & Minuman</option>
                  <option value="Kerajinan">Kerajinan</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Keramik">Keramik</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Jasa">Jasa</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nama Pemilik <span>*</span></label>
                <input type="text" id="umkmPemilik" placeholder="Nama pemilik/pengelola..." required>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Informasi Kontak</div>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="umkmEmail" placeholder="contoh@email.com">
              </div>
              <div class="form-group">
                <label>Nomor Telepon <span>*</span></label>
                <input type="tel" id="umkmTelepon" placeholder="08xx-xxxx-xxxx" required>
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group">
                <label>Alamat Lengkap <span>*</span></label>
                <textarea id="umkmAlamat" placeholder="Masukkan alamat lengkap UMKM..." required></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Deskripsi</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Deskripsi UMKM</label>
                <textarea id="umkmDeskripsi" placeholder="Jelaskan tentang UMKM Anda, produk, layanan, dll..."></textarea>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="closeFormModal()">Batal</button>
            <button type="submit" class="btn-submit">Tambahkan UMKM</button>
          </div>
        </form>
      </div>
    </div>
  `
  document.body.insertAdjacentHTML("beforeend", modalHTML)
}

function showAddDestinasiFull() {
  const modalHTML = `
    <div class="form-modal-overlay active" id="formModalOverlay">
      <div class="form-modal">
        <div class="form-header">
          <h3><i class="fas fa-map-marker-alt"></i> Tambah Destinasi Wisata</h3>
          <button class="form-close-btn" onclick="closeFormModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="form-body" id="formAddDestinasi" onsubmit="submitAddDestinasi(event)">
          <div class="form-section">
            <div class="form-section-title">Informasi Dasar</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Nama Destinasi Wisata <span>*</span></label>
                <input type="text" id="destinasiNama" placeholder="Contoh: Pantai Indah Tangsel..." required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Kategori <span>*</span></label>
                <select id="destinasiKategori" required>
                  <option value="">Pilih Kategori</option>
                  <option value="Pantai">Pantai</option>
                  <option value="Pegunungan">Pegunungan</option>
                  <option value="Taman">Taman</option>
                  <option value="Museum">Museum</option>
                  <option value="Budaya">Budaya</option>
                  <option value="Olahraga">Olahraga Air</option>
                  <option value="Kuliner">Kuliner</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tahun Didirikan</label>
                <input type="number" id="destinasiTahun" min="1900" max="2099" placeholder="2020">
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Lokasi & Kontak</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Alamat Lengkap <span>*</span></label>
                <textarea id="destinasiAlamat" placeholder="Masukkan alamat lengkap destinasi wisata..." required></textarea>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Nomor Telepon</label>
                <input type="tel" id="destinasiTelepon" placeholder="021-xxxx-xxxx">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="destinasiEmail" placeholder="info@destinasi.com">
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Jam Operasional</div>
            <div class="form-row">
              <div class="form-group">
                <label>Jam Buka <span>*</span></label>
                <input type="time" id="destinasiBuka" required>
              </div>
              <div class="form-group">
                <label>Jam Tutup <span>*</span></label>
                <input type="time" id="destinasiTutup" required>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Deskripsi & Foto</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Deskripsi Destinasi</label>
                <textarea id="destinasiDeskripsi" placeholder="Jelaskan tentang destinasi wisata, daya tarik, fasilitas, dll..."></textarea>
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group">
                <label>Upload Foto Destinasi</label>
                <div class="photo-upload-area" id="photoUploadArea" ondrop="handlePhotoDrop(event)" ondragover="handlePhotoDragOver(event)" ondragleave="handlePhotoDragLeave(event)" onclick="document.getElementById('destinasiFoto').click()">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p id="photoUploadText">Klik untuk upload atau drag foto ke sini</p>
                  <small>Format: JPG, PNG | Ukuran maksimal: 5MB</small>
                  <input type="file" id="destinasiFoto" accept="image/*" onchange="handlePhotoSelect(event)">
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="closeFormModal()">Batal</button>
            <button type="submit" class="btn-submit">Tambahkan Destinasi</button>
          </div>
        </form>
      </div>
    </div>
  `
  document.body.insertAdjacentHTML("beforeend", modalHTML)
  setupDragAndDrop()
}

function setupDragAndDrop() {
  const uploadArea = document.getElementById("photoUploadArea")
  if (!uploadArea) return

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault()
    uploadArea.classList.add("drag-over")
  })

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over")
  })

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault()
    uploadArea.classList.remove("drag-over")
    const files = e.dataTransfer.files
    if (files.length > 0) {
      document.getElementById("destinasiFoto").files = files
      handlePhotoSelect({ target: { files: files } })
    }
  })
}

function handlePhotoDragOver(event) {
  event.preventDefault()
  event.currentTarget.classList.add("drag-over")
}

function handlePhotoDragLeave(event) {
  event.currentTarget.classList.remove("drag-over")
}

function handlePhotoDrop(event) {
  event.preventDefault()
  event.currentTarget.classList.remove("drag-over")
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const fileInput = document.getElementById("destinasiFoto")
    fileInput.files = files
    handlePhotoSelect({ target: { files: files } })
  }
}

function handlePhotoSelect(event) {
  const file = event.target.files[0]
  if (file) {
    const uploadArea = document.getElementById("photoUploadArea")
    const uploadText = document.getElementById("photoUploadText")
    if (uploadArea && uploadText) {
      uploadText.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      uploadArea.style.borderColor = "#10b981"
      uploadArea.style.backgroundColor = "#ecfdf5"
    }
  }
}

function submitAddDestinasi(event) {
  event.preventDefault()

  const fotoFile = document.getElementById("destinasiFoto").files[0]
  const nama = document.getElementById("destinasiNama").value
  const kategori = document.getElementById("destinasiKategori").value
  const alamat = document.getElementById("destinasiAlamat").value
  const telepon = document.getElementById("destinasiTelepon").value
  const email = document.getElementById("destinasiEmail").value
  const jamBuka = document.getElementById("destinasiBuka").value
  const jamTutup = document.getElementById("destinasiTutup").value
  const deskripsi = document.getElementById("destinasiDeskripsi").value

  const token = localStorage.getItem("authToken")

  // Function to add destinasi after photo upload (if photo exists)
  const addDestinasiToDB = async (fotoUrl = null) => {
    try {
      const payload = {
        nama_destinasi: nama,
        kategori: kategori,
        alamat: alamat,
        nomor_telepon: telepon || null,
        email: email || null,
        jam_buka: jamBuka,
        jam_tutup: jamTutup,
        deskripsi: deskripsi || null,
        foto_url: fotoUrl,
      }

      console.log("[v0] Sending destinasi payload:", payload)

      const response = await fetch("http://localhost:5000/api/wisata", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      console.log("[v0] Destinasi response:", result)

      if (result.success) {
        alert("Destinasi wisata berhasil ditambahkan!")
        closeFormModal()
        loadDestinationList()
        loadActivityList()
      } else {
        alert("Gagal: " + (result.message || "Terjadi kesalahan"))
      }
    } catch (err) {
      console.error("[v0] Error adding destinasi:", err)
      alert("Error: " + err.message)
    }
  }

  // Upload photo if selected
  if (fotoFile) {
    const formData = new FormData()
    formData.append("file", fotoFile)

    fetch("http://localhost:5000/api/upload/single", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("[v0] Upload response:", result)
        if (result.success) {
          addDestinasiToDB(result.url)
        } else {
          alert("Gagal upload foto: " + (result.message || "Terjadi kesalahan"))
        }
      })
      .catch((err) => {
        console.error("[v0] Upload error:", err)
        alert("Error upload: " + err.message)
      })
  } else {
    // No photo, add destinasi directly
    addDestinasiToDB()
  }
}

function showAddAdminForm() {
  const modalHTML = `
    <div class="form-modal-overlay active" id="formModalOverlay">
      <div class="form-modal">
        <div class="form-header">
          <h3><i class="fas fa-user-tie"></i> Tambah Admin Baru</h3>
          <button class="form-close-btn" onclick="closeFormModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="form-body" id="formAddAdmin" onsubmit="submitAddAdmin(event)">
          <div class="form-section">
            <div class="form-section-title">Informasi Pribadi</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Nama Lengkap <span>*</span></label>
                <input type="text" id="adminNama" placeholder="Masukkan nama lengkap..." required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tanggal Lahir <span>*</span></label>
                <input type="date" id="adminTglLahir" required>
              </div>
              <div class="form-group">
                <label>Role <span>*</span></label>
                <select id="adminRole" required>
                  <option value="">Pilih Role</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Akun Login</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Username <span>*</span></label>
                <input type="text" id="adminUsername" placeholder="Masukkan username..." required>
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group">
                <label>Password <span>*</span></label>
                <input type="password" id="adminPassword" placeholder="Masukkan password yang kuat..." required>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="closeFormModal()">Batal</button>
            <button type="submit" class="btn-submit">Tambahkan Admin</button>
          </div>
        </form>
      </div>
    </div>
  `
  document.body.insertAdjacentHTML("beforeend", modalHTML)
}

function closeFormModal() {
  const overlay = document.getElementById("formModalOverlay")
  if (overlay) {
    overlay.classList.remove("active")
    setTimeout(() => {
      overlay.remove()
    }, 300)
  }
}

function submitAddUMKM(event) {
  event.preventDefault()
  const data = {
    nama_umkm: document.getElementById("umkmNama").value,
    kategori_usaha: document.getElementById("umkmKategori").value,
    pemilik: document.getElementById("umkmPemilik").value,
    email: document.getElementById("umkmEmail").value || null,
    nomor_telepon: document.getElementById("umkmTelepon").value,
    alamat: document.getElementById("umkmAlamat").value,
    deskripsi: document.getElementById("umkmDeskripsi").value || null,
    status: "approved",
  }

  const token = localStorage.getItem("authToken")
  fetch("http://localhost:5000/api/umkm", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        alert("UMKM berhasil ditambahkan!")
        closeFormModal()
        loadDashboardStats()
        loadUMKMTable()
        loadActivityList()
      } else {
        alert("Gagal: " + (result.message || "Terjadi kesalahan"))
      }
    })
    .catch((err) => {
      console.error("[v0] Error adding UMKM:", err)
      alert("Error: " + err.message)
    })
}

function submitAddAdmin(event) {
  event.preventDefault()
  const data = {
    full_name: document.getElementById("adminNama").value,
    tanggal_lahir: document.getElementById("adminTglLahir").value,
    role: document.getElementById("adminRole").value,
    username: document.getElementById("adminUsername").value,
    password: document.getElementById("adminPassword").value,
  }

  const token = localStorage.getItem("authToken")
  fetch("http://localhost:5000/api/admin/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        alert("Admin berhasil ditambahkan!")
        closeFormModal()
        loadAdminList()
        loadActivityList()
      } else {
        alert("Gagal: " + (result.message || "Terjadi kesalahan"))
      }
    })
    .catch((err) => {
      console.error("[v0] Error adding admin:", err)
      alert("Error: " + err.message)
    })
}

// ===== LOGOUT =====
window.logoutAdmin = async () => {
  try {
    const token = localStorage.getItem("authToken")
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error("Logout error:", error)
  }

  localStorage.removeItem("authToken")
  localStorage.removeItem("adminData")
  window.location.href = "../login.html"
}

window.closePengajuanModal = () => {
  document.getElementById("pengajuan-modal").classList.remove("active")
}

// ===== ADMIN LIST =====
async function loadAdminList() {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch("http://localhost:5000/api/admin/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    const tableBody = document.getElementById("admin-table-body")

    if (data.success && data.data && data.data.length > 0) {
      tableBody.innerHTML = data.data
        .map(
          (admin, index) => `
        <tr>
          <td>${admin.id}</td>
          <td>${admin.full_name || "-"}</td>
          <td>${admin.username}</td>
          <td><span class="role-badge ${admin.role}">${admin.role === "superadmin" ? "Super Admin" : "Admin"}</span></td>
          <td>${admin.tanggal_lahir ? new Date(admin.tanggal_lahir).toLocaleDateString("id-ID") : "-"}</td>
          <td><span class="status-badge ${admin.is_active ? "aktif" : "tidak-aktif"}">${admin.is_active ? "Aktif" : "Tidak Aktif"}</span></td>
          <td>
            <button class="btn btn-small" data-deactivate-id="${admin.id}" ${admin.role === "superadmin" ? "disabled" : ""}>
              ${admin.is_active ? "Nonaktifkan" : "Aktifkan"}
            </button>
            <button class="btn btn-delete btn-small" data-delete-admin-id="${admin.id}" ${admin.role === "superadmin" ? "disabled" : ""}>
              Hapus
            </button>
          </td>
        </tr>
      `,
        )
        .join("")

      // Event listeners for deactivate buttons
      document.querySelectorAll("[data-deactivate-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          const adminId = this.getAttribute("data-deactivate-id")
          toggleAdminStatus(adminId)
        })
      })

      // Event listeners for delete buttons
      document.querySelectorAll("[data-delete-admin-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          const adminId = this.getAttribute("data-delete-admin-id")
          deleteAdmin(adminId)
        })
      })
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="7" style="text-align: center; color: #9ca3af;">Tidak ada admin lain</td></tr>'
    }
  } catch (error) {
    console.error("Error loading admin list:", error)
  }
}

function toggleAdminStatus(adminId) {
  // Placeholder for toggle admin status functionality
  console.log("Toggle admin status for ID:", adminId)
}

function deleteAdmin(adminId) {
  // Placeholder for delete admin functionality
  console.log("Delete admin with ID:", adminId)
}

// ===== MEMBER LIST =====
async function loadMemberList() {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch("http://localhost:5000/api/admin/members", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    console.log("[v0] Member list response:", data)
    const tableBody = document.getElementById("anggota-table-body")

    if (data.success && data.data && data.data.length > 0) {
      tableBody.innerHTML = data.data
        .map(
          (member, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${member.full_name || "-"}</strong></td>
          <td>${member.email || "-"}</td>
          <td>${member.nomor_telepon || "-"}</td>
          <td>${new Date(member.created_at).toLocaleDateString("id-ID")}</td>
          <td>
            <button class="btn btn-edit btn-small" data-view-member="${member.id}">Detail</button>
            <button class="btn btn-delete btn-small" data-delete-member="${member.id}">Hapus</button>
          </td>
        </tr>
      `,
        )
        .join("")

      document.querySelectorAll("[data-view-member]").forEach((btn) => {
        btn.addEventListener("click", function () {
          viewMemberDetail(this.getAttribute("data-view-member"))
        })
      })

      document.querySelectorAll("[data-delete-member]").forEach((btn) => {
        btn.addEventListener("click", function () {
          deleteMember(this.getAttribute("data-delete-member"))
        })
      })
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">Tidak ada anggota</td></tr>'
    }
  } catch (error) {
    console.error("[v0] Error loading member list:", error)
  }
}

async function viewMemberDetail(memberId) {
  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch(`http://localhost:5000/api/admin/members/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (data.success && data.data) {
      const member = data.data
      const modalHTML = `
        <div class="member-detail-modal-overlay" id="memberDetailOverlay" onclick="closeMemberDetailModal()">
          <div class="member-detail-modal" onclick="event.stopPropagation()">
            <button class="modal-close-btn" onclick="closeMemberDetailModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div class="member-detail-header">
              <div class="member-avatar">
                ${member.foto_profile ? `<img src="${member.foto_profile}" alt="${member.full_name}">` : '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'}
              </div>
              <div class="member-header-info">
                <h2>${member.full_name}</h2>
                <p class="member-email">${member.email}</p>
              </div>
            </div>

            <div class="member-detail-body">
              <div class="detail-section">
                <h3 class="section-title">Informasi Pribadi</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Tanggal Lahir</span>
                    <span class="detail-value">${member.tanggal_lahir ? new Date(member.tanggal_lahir).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "-"}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Nomor Telepon</span>
                    <span class="detail-value">${member.nomor_telepon || "-"}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h3 class="section-title">Akun</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${member.email}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Status Akun</span>
                    <span class="detail-value">
                      <span class="status-badge ${member.status === "active" ? "aktif" : "tidak-aktif"}">
                        ${member.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h3 class="section-title">Riwayat</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Tanggal Daftar</span>
                    <span class="detail-value">${new Date(member.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Terakhir Diperbarui</span>
                    <span class="detail-value">${new Date(member.updated_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="member-detail-footer">
              <button class="btn btn-secondary" onclick="closeMemberDetailModal()">Tutup</button>
              <button class="btn btn-danger" onclick="deleteMember('${member.id}'); closeMemberDetailModal()">Hapus Anggota</button>
            </div>
          </div>
        </div>
      `

      document.body.insertAdjacentHTML("beforeend", modalHTML)
    } else {
      alert("Data anggota tidak ditemukan")
    }
  } catch (error) {
    console.error("[v0] Error loading member detail:", error)
    alert("Gagal memuat detail anggota")
  }
}

function closeMemberDetailModal() {
  const overlay = document.getElementById("memberDetailOverlay")
  if (overlay) {
    overlay.remove()
  }
}

async function deleteMember(memberId) {
  if (confirm("Apakah Anda yakin ingin menghapus anggota ini?")) {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:5000/api/admin/members/${memberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      console.log("[v0] Delete member response:", data)

      if (data.success) {
        loadMemberList()
        loadActivityList()
        alert("Anggota berhasil dihapus")
        closeMemberDetailModal()
      } else {
        alert("Gagal menghapus anggota: " + data.message)
      }
    } catch (error) {
      console.error("[v0] Error deleting member:", error)
      alert("Error menghapus anggota: " + error.message)
    }
  }
}

function showAddMemberForm() {
  const modalHTML = `
    <div class="form-modal-overlay active" id="formModalOverlay">
      <div class="form-modal">
        <div class="form-header">
          <h3><i class="fas fa-user-plus"></i> Tambah Anggota Baru</h3>
          <button class="form-close-btn" onclick="closeFormModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form class="form-body" id="formAddMember" onsubmit="submitAddMember(event)">
          <div class="form-section">
            <div class="form-section-title">Informasi Pribadi</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Nama Lengkap <span>*</span></label>
                <input type="text" id="memberNama" placeholder="Masukkan nama lengkap..." required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Tanggal Lahir <span>*</span></label>
                <input type="date" id="memberTglLahir" required>
              </div>
              <div class="form-group">
                <label>Nomor Telepon <span>*</span></label>
                <input type="tel" id="memberTelepon" placeholder="08xx-xxxx-xxxx" required>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Akun Login</div>
            <div class="form-row full">
              <div class="form-group">
                <label>Email (Username) <span>*</span></label>
                <input type="email" id="memberEmail" placeholder="contoh@email.com" required>
              </div>
            </div>
            <div class="form-row full">
              <div class="form-group">
                <label>Password Default (Tanggal Lahir) <span>*</span></label>
                <input type="text" id="memberPasswordDefault" placeholder="Akan otomatis menjadi format YYYY-MM-DD" disabled>
                <small style="color: #6b7280; margin-top: 4px;">Password akan diset otomatis dari tanggal lahir (YYYY-MM-DD). Anggota bisa mengubahnya nanti.</small>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" onclick="closeFormModal()">Batal</button>
            <button type="submit" class="btn-submit">Tambahkan Anggota</button>
          </div>
        </form>
      </div>
    </div>
  `
  document.body.insertAdjacentHTML("beforeend", modalHTML)

  document.getElementById("memberTglLahir").addEventListener("change", function () {
    document.getElementById("memberPasswordDefault").value = this.value
  })
}

function submitAddMember(event) {
  event.preventDefault()

  const nama = document.getElementById("memberNama").value
  const tglLahir = document.getElementById("memberTglLahir").value
  const telepon = document.getElementById("memberTelepon").value
  const email = document.getElementById("memberEmail").value

  if (!tglLahir) {
    alert("Tanggal lahir harus diisi untuk menentukan password default")
    return
  }

  const data = {
    full_name: nama,
    email: email,
    nomor_telepon: telepon,
    tanggal_lahir: tglLahir,
  }

  const token = localStorage.getItem("authToken")

  fetch("http://localhost:5000/api/admin/members/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => {
      console.log("[v0] Add member response:", result)
      if (result.success) {
        alert("Anggota berhasil ditambahkan!\nEmail: " + email + "\nPassword awal: " + tglLahir)
        closeFormModal()
        loadMemberList()
        loadActivityList()
      } else {
        alert("Gagal: " + (result.message || "Terjadi kesalahan"))
      }
    })
    .catch((err) => {
      console.error("[v0] Error adding member:", err)
      alert("Error: " + err.message)
    })
}
