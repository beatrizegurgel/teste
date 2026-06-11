// Cliente HTTP único para falar com o API Gateway (/api/*).
// Anexa o JWT salvo em localStorage a cada requisição.
const BASE = '/api'
const TOKEN_KEY = 'nomad_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

function authHeaders(extra = {}) {
  const token = tokenStore.get()
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra }
}

async function request(path, { method = 'GET', body, headers, raw } = {}) {
  const opts = { method, headers: authHeaders(headers || {}) }
  if (body !== undefined) {
    if (body instanceof FormData) {
      opts.body = body // o browser define o boundary do multipart
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }
  const res = await fetch(BASE + path, opts)
  if (raw) return res
  let data = {}
  try {
    data = await res.json()
  } catch {
    /* resposta sem corpo */
  }
  if (!res.ok) {
    const err = new Error(data.error || data.message || `Erro ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

const qs = (params = {}) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return entries.length ? '?' + new URLSearchParams(entries).toString() : ''
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  listClients: () => request('/auth/clients'),
  createClient: (payload) => request('/auth/clients', { method: 'POST', body: payload }),
  createUser: (payload) => request('/auth/users', { method: 'POST', body: payload }),

  // Posts
  listPosts: (params = {}) => request('/posts' + qs(params)),
  getPost: (id) => request(`/posts/${id}`),
  createPost: (payload) => request('/posts', { method: 'POST', body: payload }),
  updatePost: (id, payload) => request(`/posts/${id}`, { method: 'PUT', body: payload }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  approvePost: (id) => request(`/posts/${id}/approve`, { method: 'POST' }),
  rejectPost: (id, message) => request(`/posts/${id}/reject`, { method: 'POST', body: { message } }),
  commentPost: (id, message) => request(`/posts/${id}/comment`, { method: 'POST', body: { message } }),
  postEvents: (id) => request(`/posts/${id}/events`),
  stats: () => request('/stats/overview'),

  // Files
  uploadFile: (formData) => request('/files', { method: 'POST', body: formData }),
  fileMeta: (id) => request(`/files/${id}/meta`),
  fileBlob: async (id) => {
    const res = await request(`/files/${id}`, { raw: true })
    if (!res.ok) throw new Error('Falha ao carregar o arquivo')
    return res.blob()
  },
}
