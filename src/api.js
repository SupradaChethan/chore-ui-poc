const API_BASE = 'http://localhost:8080/api/v1'

// User API calls
export const userAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/users`)
    return res.json()
  },

  create: async (user) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    return res.json()
  },

  update: async (id, user) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' })
  }
}

// Chore API calls
export const choreAPI = {
  getAll: async (date) => {
    const url = date ? `${API_BASE}/chores?date=${date}` : `${API_BASE}/chores`
    const res = await fetch(url)
    return res.json()
  },

  getByUser: async (userId, date) => {
    const res = await fetch(`${API_BASE}/chores/user/${userId}?date=${date}`)
    return res.json()
  },

  create: async (chore) => {
    const res = await fetch(`${API_BASE}/chores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chore)
    })
    return res.json()
  },

  update: async (id, chore) => {
    const res = await fetch(`${API_BASE}/chores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chore)
    })
    return res.json()
  },

  delete: async (id) => {
    await fetch(`${API_BASE}/chores/${id}`, { method: 'DELETE' })
  }
}

// AI Assistant API
export const assistantAPI = {
  chat: async (sessionId, message) => {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message })
    })
    return res.json()
  }
}
