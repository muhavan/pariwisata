// API Configuration
const API_BASE_URL = "http://localhost:5000/api"

// Storage key untuk JWT token
const TOKEN_KEY = "auth_token"

// Helper function untuk fetch dengan error handling
async function apiCall(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  // Add token jika ada
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "API Error")
    }

    return data
  } catch (error) {
    console.error("[v0] API Error:", error)
    throw error
  }
}

// Auth API
const AuthAPI = {
  login: async (username, password) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  },

  logout: async () => {
    return apiCall("/auth/logout", { method: "POST" })
  },

  getCurrentUser: async () => {
    return apiCall("/auth/me")
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY)
  },

  isLoggedIn: () => {
    return !!localStorage.getItem(TOKEN_KEY)
  },
}

// UMKM API
const UMKMAPI = {
  getApproved: async (category = null) => {
    let endpoint = "/umkm"
    if (category) {
      endpoint += `?category=${encodeURIComponent(category)}`
    }
    return apiCall(endpoint)
  },

  getPending: async () => {
    return apiCall("/umkm/pending")
  },

  submit: async (umkmData) => {
    return apiCall("/umkm/submit", {
      method: "POST",
      body: JSON.stringify(umkmData),
    })
  },

  approve: async (id) => {
    return apiCall(`/umkm/${id}/approve`, { method: "POST" })
  },

  reject: async (id, reason) => {
    return apiCall(`/umkm/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  },

  delete: async (id) => {
    return apiCall(`/umkm/${id}`, { method: "DELETE" })
  },
}

// Wisata API
const WisataAPI = {
  getAll: async (kategori = null) => {
    let endpoint = "/wisata"
    if (kategori) {
      endpoint += `?kategori=${encodeURIComponent(kategori)}`
    }
    return apiCall(endpoint)
  },

  getById: async (id) => {
    return apiCall(`/wisata/${id}`)
  },

  add: async (wisataData) => {
    return apiCall("/wisata", {
      method: "POST",
      body: JSON.stringify(wisataData),
    })
  },

  update: async (id, wisataData) => {
    return apiCall(`/wisata/${id}`, {
      method: "PUT",
      body: JSON.stringify(wisataData),
    })
  },

  delete: async (id) => {
    return apiCall(`/wisata/${id}`, { method: "DELETE" })
  },
}

// Admin API
const AdminAPI = {
  getStats: async () => {
    return apiCall("/admin/stats")
  },

  getLogs: async (limit = 10) => {
    return apiCall(`/admin/logs?limit=${limit}`)
  },
}
