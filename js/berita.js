let currentPageBerita = 1
const itemsPerPageBerita = 6
let allBerita = []
let filteredBerita = []

// Load all berita
async function loadAllBerita() {
  try {
    const response = await fetch("http://localhost:5000/api/berita")
    const data = await response.json()

    if (data.success && data.data) {
      allBerita = data.data
      filteredBerita = data.data
      displayBerita(currentPageBerita)
      setupPaginationBerita()
    }
  } catch (error) {
    console.error("Error loading berita:", error)
    document.getElementById("berita-grid").innerHTML =
      '<p style="text-align: center; color: #d32f2f;">Gagal memuat berita</p>'
  }
}

// Display berita for current page
function displayBerita(page) {
  const grid = document.getElementById("berita-grid")
  grid.innerHTML = ""

  const start = (page - 1) * itemsPerPageBerita
  const end = start + itemsPerPageBerita
  const pageItems = filteredBerita.slice(start, end)

  if (pageItems.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #9ca3af; grid-column: 1/-1;">Tidak ada berita</p>'
    return
  }

  pageItems.forEach((item) => {
    const card = document.createElement("div")
    card.className = "berita-card"
    const tanggal = new Date(item.created_at).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    card.innerHTML = `
      <div class="berita-image">
        <img src="${item.foto_url || "/placeholder.svg?key=kqtsx"}" alt="${item.judul}">
      </div>
      <div class="berita-content">
        <h3>${item.judul}</h3>
        <p>${item.konten.substring(0, 120)}...</p>
        <p class="berita-date">📅 ${tanggal}</p>
      </div>
    `
    grid.appendChild(card)
  })
}

// Setup pagination for berita
function setupPaginationBerita() {
  const pagination = document.getElementById("pagination-berita")
  pagination.innerHTML = ""

  const totalPages = Math.ceil(filteredBerita.length / itemsPerPageBerita)

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button")
    button.className = "pagination-btn"
    if (i === currentPageBerita) button.classList.add("active")
    button.textContent = i
    button.addEventListener("click", () => {
      currentPageBerita = i
      displayBerita(currentPageBerita)
      setupPaginationBerita()
      window.scrollTo(0, 0)
    })
    pagination.appendChild(button)
  }
}

// Search functionality
document.getElementById("search-berita").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase()
  currentPageBerita = 1
  filteredBerita = allBerita.filter(
    (berita) => berita.judul.toLowerCase().includes(searchTerm) || berita.konten.toLowerCase().includes(searchTerm),
  )
  displayBerita(currentPageBerita)
  setupPaginationBerita()
})

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadAllBerita()
})
