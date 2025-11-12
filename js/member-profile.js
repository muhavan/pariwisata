// Helper function to show error
function showError(message) {
  const errorDiv = document.getElementById("form-error")
  const errorText = document.getElementById("error-text")
  errorText.textContent = message
  errorDiv.style.display = "block"
  setTimeout(() => {
    errorDiv.style.display = "none"
  }, 5000)
}

// Helper function to show success
function showSuccess(message) {
  const successDiv = document.getElementById("form-success")
  const successText = document.getElementById("success-text")
  successText.textContent = message
  successDiv.style.display = "block"
  setTimeout(() => {
    successDiv.style.display = "none"
  }, 5000)
}

// Upload photo to server
async function uploadPhoto(file) {
  if (!file) return null

  // For now, we'll simulate file upload
  // In production, you would use FormData with multipart/form-data
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      const base64Data = e.target.result
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Load existing profile
async function loadProfile(umkmId) {
  try {
    const response = await fetch(`http://localhost:5000/api/member/${umkmId}/profile`)
    const data = await response.json()

    if (data.success && data.data) {
      document.getElementById("full-name").value = data.data.full_name || ""
      if (data.data.foto_profile) {
        const photoPreview = document.getElementById("photo-preview")
        photoPreview.innerHTML = `<img src="${data.data.foto_profile}" alt="Foto Profil" style="max-width: 200px; border-radius: 8px;">`
      }
    }
  } catch (error) {
    console.error("Error loading profile:", error)
  }
}

// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-form")
  const photoInput = document.getElementById("profile-photo")

  // Preview photo when selected
  if (photoInput) {
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const preview = document.getElementById("photo-preview")
          preview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 200px; border-radius: 8px;">`
        }
        reader.readAsDataURL(file)
      }
    })
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const umkmId = document.getElementById("umkm-id").value
      const fullName = document.getElementById("full-name").value
      const photoFile = photoInput?.files[0]

      if (!umkmId || !fullName) {
        showError("ID UMKM dan Nama Lengkap harus diisi")
        return
      }

      try {
        let fotoProfile = null

        // Upload photo if selected
        if (photoFile) {
          fotoProfile = await uploadPhoto(photoFile)
        }

        // Update profile
        const response = await fetch(`http://localhost:5000/api/member/${umkmId}/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            foto_profile: fotoProfile,
          }),
        })

        const result = await response.json()

        if (result.success) {
          showSuccess("Profil berhasil diperbarui!")
          form.reset()
          document.getElementById("photo-preview").innerHTML = ""
        } else {
          showError("Gagal memperbarui profil: " + result.message)
        }
      } catch (error) {
        console.error("Error updating profile:", error)
        showError("Error: " + error.message)
      }
    })
  }
})
