let currentPage = 1
const itemsPerPage = 10
let allUMKM = []
let filteredUMKM = []

// Load all UMKM data
async function loadAllUMKM() {
  try {
    const response = await fetch("http://localhost:5000/api/umkm")
    const data = await response.json()

    if (data.success && data.data) {
      allUMKM = data.data
      filteredUMKM = data.data
      displayUMKM(currentPage)
      setupPagination()
    }
  } catch (error) {
    console.error("Error loading UMKM:", error)
    document.getElementById("umkm-table-body").innerHTML =
      '<tr><td colspan="6" style="text-align: center; color: #d32f2f;">Gagal memuat data UMKM</td></tr>'
  }
}

// Display UMKM for current page
function displayUMKM(page) {
  const tableBody = document.getElementById("umkm-table-body")
  tableBody.innerHTML = ""

  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  const pageItems = filteredUMKM.slice(start, end)

  if (pageItems.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">Tidak ada data UMKM</td></tr>'
    return
  }

  pageItems.forEach((item, index) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${start + index + 1}</td>
      <td>${item.nama_umkm}</td>
      <td>${item.kategori_usaha}</td>
      <td>${item.alamat}</td>
      <td>${item.nomor_telepon}</td>
      <td><span class="status-badge">${item.status || "Aktif"}</span></td>
    `
    tableBody.appendChild(row)
  })
}

// Setup pagination
function setupPagination() {
  const pagination = document.getElementById("pagination")
  pagination.innerHTML = ""

  const totalPages = Math.ceil(filteredUMKM.length / itemsPerPage)

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button")
    button.className = "pagination-btn"
    if (i === currentPage) button.classList.add("active")
    button.textContent = i
    button.addEventListener("click", () => {
      currentPage = i
      displayUMKM(currentPage)
      setupPagination()
      window.scrollTo(0, 0)
    })
    pagination.appendChild(button)
  }
}

// Search functionality
document.getElementById("search-umkm").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase()
  currentPage = 1
  filteredUMKM = allUMKM.filter(
    (umkm) =>
      umkm.nama_umkm.toLowerCase().includes(searchTerm) ||
      umkm.kategori_usaha.toLowerCase().includes(searchTerm) ||
      umkm.alamat.toLowerCase().includes(searchTerm),
  )
  displayUMKM(currentPage)
  setupPagination()
})

// Filter by category
document.getElementById("filter-kategori").addEventListener("change", (e) => {
  const kategori = e.target.value
  currentPage = 1
  filteredUMKM = kategori === "" ? allUMKM : allUMKM.filter((umkm) => umkm.kategori_usaha === kategori)
  displayUMKM(currentPage)
  setupPagination()
})

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadAllUMKM()
})
