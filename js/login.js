document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form")

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      const username = document.getElementById("username").value.trim()
      const password = document.getElementById("password").value

      console.log("[v0] Attempting MySQL login with username:", username)

      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })

        const data = await response.json()
        console.log("[v0] Login response:", data)

        if (data.success) {
          // Store token in localStorage for future requests
          localStorage.setItem("authToken", data.token)
          localStorage.setItem("adminData", JSON.stringify(data.admin))

          showSuccessNotification(`Selamat datang ${data.admin.full_name}!`)

          setTimeout(() => {
            window.location.href = "admin/dashboard.html"
          }, 1500)
        } else {
          console.log("[v0] Login failed:", data.message)
          showErrorNotification(data.message)
          document.getElementById("password").value = ""
        }
      } catch (error) {
        console.error("[v0] Login error:", error)
        showErrorNotification("Gagal terhubung ke server. Pastikan server berjalan di http://localhost:5000")
        document.getElementById("password").value = ""
      }
    })
  } else {
    console.error("[v0] Login form not found")
  }
})

function showErrorNotification(message) {
  const errorNotif = document.getElementById("error-notification")
  const errorMsg = document.getElementById("error-message")

  errorMsg.textContent = message
  errorNotif.style.display = "flex"

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorNotif.style.display = "none"
  }, 5000)
}

function showSuccessNotification(message) {
  const successNotif = document.getElementById("success-notification")
  const successMsg = document.getElementById("success-message")

  successMsg.textContent = message
  successNotif.style.display = "flex"
}

function closeNotification() {
  document.getElementById("error-notification").style.display = "none"
}
