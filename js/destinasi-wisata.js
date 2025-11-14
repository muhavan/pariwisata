let currentPageWisata = 1
const itemsPerPageWisata = 6
let allWisata = []
let filteredWisata = []

// Load all destinasi wisata
async function loadAllWisata() {
  try {
    const response = await fetch("http://localhost:5000/api/wisata")
    const data = await response.json()

    if (data.success && data.data) {
      allWisata = data.data
      filteredWisata = data.data
      displayWisata(currentPageWisata)
      setupPaginationWisata()
    }
  } catch (error) {
    console.error("Error loading wisata:", error)
    document.getElementById("destinasi-grid").innerHTML =
      '<p style="text-align: center; color: #d32f2f;">Gagal memuat destinasi wisata</p>'
  }
}

// Display destinasi wisata for current page
function displayWisata(page) {
  const grid = document.getElementById("destinasi-grid")
  grid.innerHTML = ""

  const start = (page - 1) * itemsPerPageWisata
  const end = start + itemsPerPageWisata
  const pageItems = filteredWisata.slice(start, end)

  if (pageItems.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #9ca3af; grid-column: 1/-1;">Tidak ada destinasi wisata</p>'
    return
  }

  pageItems.forEach((item) => {
    const card = document.createElement("div")
    card.className = "destinasi-card"
    card.innerHTML = `
      <div class="destinasi-image">
        <img src="${item.foto_url || "/placeholder.svg?key=z5ra5"}" alt="${item.nama_destinasi}">
      </div>
      <div class="destinasi-content">
        <h3>${item.nama_destinasi}</h3>
        <p>${item.deskripsi || ""}</p>
        <p class="destinasi-location">📍 ${item.alamat}</p>
        ${item.nomor_telepon ? `<p style="color: #6b7280; font-size: 0.9rem;">📞 ${item.nomor_telepon}</p>` : ""}
      </div>
    `
    grid.appendChild(card)
  })
}

// Setup pagination for wisata
function setupPaginationWisata() {
  const pagination = document.getElementById("pagination-wisata")
  pagination.innerHTML = ""

  const totalPages = Math.ceil(filteredWisata.length / itemsPerPageWisata)

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button")
    button.className = "pagination-btn"
    if (i === currentPageWisata) button.classList.add("active")
    button.textContent = i
    button.addEventListener("click", () => {
      currentPageWisata = i
      displayWisata(currentPageWisata)
      setupPaginationWisata()
      window.scrollTo(0, 0)
    })
    pagination.appendChild(button)
  }
}

// Search functionality
document.getElementById("search-wisata").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase()
  currentPageWisata = 1
  filteredWisata = allWisata.filter(
    (wisata) =>
      wisata.nama_destinasi.toLowerCase().includes(searchTerm) || wisata.alamat.toLowerCase().includes(searchTerm),
  )
  displayWisata(currentPageWisata)
  setupPaginationWisata()
})

// Filter by category
document.getElementById("filter-kategori-wisata").addEventListener("change", (e) => {
  const kategori = e.target.value
  currentPageWisata = 1
  filteredWisata = kategori === "" ? allWisata : allWisata.filter((wisata) => wisata.kategori === kategori)
  displayWisata(currentPageWisata)
  setupPaginationWisata()
})

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadAllWisata()
})
