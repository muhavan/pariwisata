// ===== SAMPLE DATA =====
// const umkmData = [
//   {
//     no: 1,
//     nama: "Kopi Tangsel",
//     kategori: "Minuman",
//     alamat: "Jl. Merdeka No. 10, Ciputat",
//     kontak: "0812-3456-7890",
//     status: "Aktif",
//   },
//   {
//     no: 2,
//     nama: "Batik Tangsel Craft",
//     kategori: "Kerajinan",
//     alamat: "Jl. Seni No. 5, Pondok Aren",
//     kontak: "0821-9876-5432",
//     status: "Aktif",
//   },
//   {
//     no: 3,
//     nama: "Kuliner Nusantara",
//     kategori: "Makanan",
//     alamat: "Jl. Raya Serpong No. 20",
//     kontak: "0813-5555-6666",
//     status: "Aktif",
//   },
//   {
//     no: 4,
//     nama: "Fashion Lokal Tangsel",
//     kategori: "Fashion",
//     alamat: "Jl. Pasar No. 15, Balaraja",
//     kontak: "0822-1111-2222",
//     status: "Pendaftar Baru",
//   },
//   {
//     no: 5,
//     nama: "Keramik Tradisional",
//     kategori: "Keramik",
//     alamat: "Jl. Tua No. 30, Ciputat",
//     kontak: "0814-3333-4444",
//     status: "Aktif",
//   },
// ]

// Declare the db variable
// const db = {
//   getUMKMList: () => [
//     {
//       no: 1,
//       namaUMKM: "Kopi Tangsel",
//       kategori: "Minuman",
//       alamat: "Jl. Merdeka No. 10, Ciputat",
//       telepon: "0812-3456-7890",
//       status: "Aktif",
//     },
//     {
//       no: 2,
//       namaUMKM: "Batik Tangsel Craft",
//       kategori: "Kerajinan",
//       alamat: "Jl. Seni No. 5, Pondok Aren",
//       telepon: "0821-9876-5432",
//       status: "Aktif",
//     },
//     {
//       no: 3,
//       namaUMKM: "Kuliner Nusantara",
//       kategori: "Makanan",
//       alamat: "Jl. Raya Serpong No. 20",
//       telepon: "0813-5555-6666",
//       status: "Aktif",
//     },
//     {
//       no: 4,
//       namaUMKM: "Fashion Lokal Tangsel",
//       kategori: "Fashion",
//       alamat: "Jl. Pasar No. 15, Balaraja",
//       telepon: "0822-1111-2222",
//       status: "Pendaftar Baru",
//     },
//     {
//       no: 5,
//       namaUMKM: "Keramik Tradisional",
//       kategori: "Keramik",
//       alamat: "Jl. Tua No. 30, Ciputat",
//       telepon: "0814-3333-4444",
//       status: "Aktif",
//     },
//   ],
//   submitUMKMApplication: (application) => {
//     console.log("Application submitted:", application)
//     return true // Simulate successful submission
//   },
// }

// ===== LOAD UMKM DATA =====
async function loadUMKMTable() {
  const tableBody = document.getElementById("umkm-table-body")
  if (!tableBody) return

  try {
    const response = await fetch("http://localhost:5000/api/umkm")
    const data = await response.json()

    tableBody.innerHTML = ""

    if (!data.success || !data.data || data.data.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">Belum ada UMKM yang terverifikasi</td></tr>'
      return
    }

    data.data.forEach((item, index) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.nama_umkm}</td>
        <td>${item.kategori_usaha}</td>
        <td>${item.alamat}</td>
        <td>${item.nomor_telepon}</td>
        <td><span class="status-badge">${item.status || "Aktif"}</span></td>
      `
      tableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading UMKM data:", error)
    tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; color: #d32f2f;">Gagal memuat data UMKM</td></tr>'
  }
}

// ===== SMOOTH SCROLL TO SECTION =====
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({ behavior: "smooth" })
    if (sectionId === "data-umkm") {
      loadUMKMTable()
    }
  }
}

// ===== HAMBURGER MENU =====
function setupHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      hamburger.classList.toggle("active")
    })

    document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active")
        hamburger.classList.remove("active")
      })
    })
  }
}

// ===== PENGAJUAN FORM HANDLER =====
function setupPengajuanForm() {
  const form = document.getElementById("pengajuan-form")
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const namaUMKM = document.getElementById("nama-umkm").value
      const kategori = document.getElementById("kategori").value
      const alamat = document.getElementById("alamat-umkm").value
      const telepon = document.getElementById("telepon").value
      const email = document.getElementById("email").value
      const fotoInput = document.getElementById("foto")

      try {
        // First, submit UMKM data without photo
        const response = await fetch("http://localhost:5000/api/umkm/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama_umkm: namaUMKM,
            kategori_usaha: kategori,
            alamat: alamat,
            nomor_telepon: telepon,
            email: email || null,
            foto_url: null,
          }),
        })

        const result = await response.json()

        if (result.success) {
          const umkmId = result.id

          // If there's a photo, upload it separately
          if (fotoInput?.files[0]) {
            try {
              const reader = new FileReader()
              reader.onload = async (fileEvent) => {
                const fotoUrl = fileEvent.target.result

                // Upload photo to separate table
                await fetch(`http://localhost:5000/api/umkm/${umkmId}/photos`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    foto_url: fotoUrl,
                  }),
                })
              }
              reader.readAsDataURL(fotoInput.files[0])
            } catch (photoError) {
              console.error("Photo upload error:", photoError)
            }
          }

          alert(
            `Terima kasih! Pengajuan UMKM "${namaUMKM}" telah dikirim. Admin akan meninjau dalam waktu 3-5 hari kerja.`,
          )
          form.reset()
          document.getElementById("nama-umkm").focus()
        } else {
          alert("Gagal mengirim pengajuan: " + result.message)
        }
      } catch (error) {
        console.error("Error submitting form:", error)
        alert("Error mengirim pengajuan: " + error.message)
      }
    })
  }
}

// ===== INITIALIZE =====
document.addEventListener("DOMContentLoaded", () => {
  setupHamburgerMenu()
  setupPengajuanForm()
  loadUMKMTable()
})
