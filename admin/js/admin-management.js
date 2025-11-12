// Admin Management Module
// Handles CRUD operations for admin users by superusers

// Load admin list
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
          <td><strong>${admin.full_name}</strong></td>
          <td>${admin.username}</td>
          <td>${admin.email || "-"}</td>
          <td>${admin.date_of_birth ? new Date(admin.date_of_birth).toLocaleDateString("id-ID") : "-"}</td>
          <td><span class="role-badge ${admin.role}">${admin.role}</span></td>
          <td><span class="status-badge ${admin.is_active ? "aktif" : "nonaktif"}">${admin.is_active ? "Aktif" : "Nonaktif"}</span></td>
          <td>
            ${
              admin.id !== Number.parseInt(localStorage.getItem("adminId"))
                ? `
              <button class="btn btn-edit btn-small" data-edit-id="${admin.id}">Edit</button>
              <button class="btn ${admin.is_active ? "btn-disable" : "btn-enable"} btn-small" data-toggle-id="${admin.id}">
                ${admin.is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button class="btn btn-delete btn-small" data-delete-id="${admin.id}">Hapus</button>
            `
                : '<span style="color: #9ca3af;">-</span>'
            }
          </td>
        </tr>
      `,
        )
        .join("")

      // Add event listeners
      document.querySelectorAll("[data-edit-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          editAdmin(this.getAttribute("data-edit-id"))
        })
      })

      document.querySelectorAll("[data-toggle-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          toggleAdminStatus(this.getAttribute("data-toggle-id"))
        })
      })

      document.querySelectorAll("[data-delete-id]").forEach((btn) => {
        btn.addEventListener("click", function () {
          deleteAdmin(this.getAttribute("data-delete-id"))
        })
      })
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="8" style="text-align: center; color: #9ca3af;">Data admin kosong</td></tr>'
    }
  } catch (error) {
    console.error("Error loading admin list:", error)
  }
}

// Show add admin form
function showAddAdminForm() {
  const modal = document.createElement("div")
  modal.id = "add-admin-modal"
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" id="modal-close-btn">&times;</span>
      <h2>Tambah Admin Baru</h2>
      <form id="add-admin-form" class="admin-form">
        <div class="form-group">
          <label for="add-fullname">Nama Lengkap *</label>
          <input type="text" id="add-fullname" name="full_name" required>
        </div>
        <div class="form-group">
          <label for="add-username">Username *</label>
          <input type="text" id="add-username" name="username" required>
        </div>
        <div class="form-group">
          <label for="add-email">Email</label>
          <input type="email" id="add-email" name="email">
        </div>
        <div class="form-group">
          <label for="add-dob">Tanggal Lahir *</label>
          <input type="date" id="add-dob" name="date_of_birth" required>
        </div>
        <div class="form-group">
          <label for="add-password">Password *</label>
          <input type="password" id="add-password" name="password" required>
        </div>
        <div class="form-group">
          <label for="add-confirm-password">Konfirmasi Password *</label>
          <input type="password" id="add-confirm-password" name="confirm_password" required>
        </div>
        <div class="form-group">
          <label for="add-role">Role *</label>
          <select id="add-role" name="role" required>
            <option value="">Pilih Role</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Tambah Admin</button>
      </form>
    </div>
  `
  document.body.appendChild(modal)

  const closeBtn = document.getElementById("modal-close-btn")
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.remove()
    })
  }

  document.getElementById("add-admin-form").addEventListener("submit", handleAddAdmin)
  modal.style.display = "block"
}

// Add admin
async function handleAddAdmin(e) {
  e.preventDefault()

  const password = document.getElementById("add-password").value
  const confirmPassword = document.getElementById("add-confirm-password").value

  if (password !== confirmPassword) {
    alert("Password tidak cocok!")
    return
  }

  const formData = {
    full_name: document.getElementById("add-fullname").value,
    username: document.getElementById("add-username").value,
    email: document.getElementById("add-email").value || null,
    date_of_birth: document.getElementById("add-dob").value,
    password: password,
    role: document.getElementById("add-role").value,
  }

  try {
    const token = localStorage.getItem("authToken")
    const response = await fetch("http://localhost:5000/api/admin/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (data.success) {
      alert("Admin berhasil ditambahkan!")
      document.getElementById("add-admin-modal").remove()
      loadAdminList()
      window.loadActivityList() // Assuming loadActivityList is declared in the global scope
    } else {
      alert("Gagal menambahkan admin: " + (data.message || "Terjadi kesalahan"))
    }
  } catch (error) {
    console.error("Error adding admin:", error)
    alert("Error menambahkan admin")
  }
}

// Edit admin
function editAdmin(adminId) {
  alert("Fitur edit admin akan diimplementasikan")
}

// Toggle admin status
async function toggleAdminStatus(adminId) {
  if (confirm("Apakah Anda yakin ingin mengubah status admin ini?")) {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:5000/api/admin/${adminId}/toggle-status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        loadAdminList()
        window.loadActivityList() // Assuming loadActivityList is declared in the global scope
        alert("Status admin berhasil diubah!")
      } else {
        alert("Gagal mengubah status admin: " + data.message)
      }
    } catch (error) {
      console.error("Error toggling admin status:", error)
      alert("Error mengubah status admin")
    }
  }
}

// Delete admin
async function deleteAdmin(adminId) {
  if (confirm("Apakah Anda yakin ingin menghapus admin ini? Tindakan ini tidak dapat dibatalkan.")) {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:5000/api/admin/${adminId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        loadAdminList()
        window.loadActivityList() // Assuming loadActivityList is declared in the global scope
        alert("Admin berhasil dihapus!")
      } else {
        alert("Gagal menghapus admin: " + data.message)
      }
    } catch (error) {
      console.error("Error deleting admin:", error)
      alert("Error menghapus admin")
    }
  }
}

// Setup admin management tab
function setupAdminManagement() {
  const addAdminBtn = document.getElementById("btn-tambah-admin")
  if (addAdminBtn) {
    addAdminBtn.addEventListener("click", showAddAdminForm)
  }
}
