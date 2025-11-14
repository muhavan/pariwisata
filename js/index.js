// Load UMKM data on page load
document.addEventListener("DOMContentLoaded", () => {
    loadUMKMData()
    loadDestinationData()
    setupFormHandlers()
    setupMobileMenu()
    setupScrollListeners()
  })
  
  async function loadUMKMData() {
    try {
      const response = await fetch("http://localhost:5000/api/umkm")
      const data = await response.json()
  
      if (data.success && data.data && data.data.length > 0) {
        const tbody = document.getElementById("umkm-table-body")
        tbody.innerHTML = data.data
          .map(
            (umkm, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${umkm.nama_umkm}</td>
            <td>${umkm.kategori_usaha}</td>
            <td>${umkm.alamat}</td>
            <td>${umkm.nomor_telepon}</td>
            <td><span class="status-badge aktif">${umkm.status || "Aktif"}</span></td>
          </tr>
        `,
          )
          .join("")
      }
    } catch (error) {
      console.error("Error loading UMKM data:", error)
    }
  }
  
  async function loadDestinationData() {
    try {
      const response = await fetch("http://localhost:5000/api/wisata")
      const data = await response.json()
      // Destination data loading if needed
    } catch (error) {
      console.error("Error loading destination data:", error)
    }
  }
  
  function setupFormHandlers() {
    const form = document.getElementById("pengajuan-form")
    if (form) {
      form.addEventListener("submit", handlePengajuanSubmit)
    }
  }
  
  async function handlePengajuanSubmit(e) {
    e.preventDefault()
  
    const formData = new FormData(e.target)
  
    try {
      const response = await fetch("http://localhost:5000/api/umkm/submit", {
        method: "POST",
        body: formData,
      })
  
      const data = await response.json()
  
      if (data.success) {
        alert("Pengajuan UMKM berhasil dikirim! Menunggu verifikasi admin.")
        e.target.reset()
      } else {
        alert("Gagal mengirim pengajuan: " + data.message)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error mengirim pengajuan")
    }
  }
  
  function setupMobileMenu() {
    const hamburger = document.querySelector(".hamburger")
    const navMenu = document.querySelector(".nav-menu")
  
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active")
      })
    }
  }
  
  function setupScrollListeners() {
    const scrollLinks = document.querySelectorAll("[data-scroll]")
    scrollLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const sectionId = link.getAttribute("data-scroll")
        scrollToSection(sectionId)
      })
    })
  }
  
  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }
