import axios, { AxiosError } from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5000/api'

export const AUTH_STORAGE_KEY = 'cspms.auth'

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getStoredToken() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)
    return parsed?.token ?? null
  } catch {
    return null
  }
}

http.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      window.dispatchEvent(new CustomEvent('cspms:unauthorized'))
    }

    return Promise.reject(error)
  },
)

function asRecord(input) {
  return typeof input === 'object' && input !== null ? input : {}
}

function extractNestedData(input) {
  const record = asRecord(input)
  if ('data' in record) {
    return record.data
  }
  if ('result' in record) {
    return record.result
  }
  if ('item' in record) {
    return record.item
  }
  return input
}

function extractArray(input) {
  if (Array.isArray(input)) {
    return input
  }

  const record = asRecord(input)
  const candidates = ['data', 'items', 'results', 'clients', 'subscriptions', 'sessions', 'payments']
  for (const key of candidates) {
    const candidate = record[key]
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  const nested = extractNestedData(input)
  return Array.isArray(nested) ? nested : []
}

function extractObject(input) {
  const nested = extractNestedData(input)
  return nested
}

function extractMessage(input) {
  const record = asRecord(input)
  return typeof record.message === 'string' ? record.message : undefined
}

function extractToken(input) {
  const record = asRecord(input)
  if (typeof record.token === 'string') {
    return record.token
  }
  if (typeof record.accessToken === 'string') {
    return record.accessToken
  }
  const nested = asRecord(record.data)
  if (typeof nested.token === 'string') {
    return nested.token
  }
  if (typeof nested.accessToken === 'string') {
    return nested.accessToken
  }
  return ''
}

function extractUser(input) {
  const record = asRecord(input)
  if (record.user) {
    return record.user
  }

  const nested = asRecord(record.data)
  if (nested.user) {
    return nested.user
  }

  if (typeof record.name === 'string' && typeof record.email === 'string') {
    return record
  }

  return null
}

export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data
    return extractMessage(payload) ?? error.message ?? 'Something went wrong.'
  }

  return error instanceof Error ? error.message : 'Something went wrong.'
}

export async function login(credentials) {
  const response = await http.post('/auth/login', credentials)
  const token = extractToken(response.data)
  const user = extractUser(response.data)

  if (!token) {
    throw new Error('Login response did not include an access token.')
  }

  if (user) {
    return { token, user }
  }

  const me = await fetchCurrentUser(token)
  return { token, user: me }
}

export async function fetchCurrentUser(token) {
  const response = await http.get('/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const user = extractUser(response.data) ?? extractObject(response.data)

  if (!user?.email) {
    throw new Error('Unable to resolve the current user profile.')
  }

  return user
}

export async function fetchUserProfile() {
  const response = await http.get('/users/profile')
  return extractObject(response.data)
}

export async function updateUserProfile(payload) {
  const response = await http.put('/users/profile', payload)
  return extractObject(response.data)
}

export async function changeUserPassword(payload) {
  const response = await http.put('/users/change-password', payload)
  return extractObject(response.data)
}

export async function uploadUserProfilePicture(formData) {
  const response = await http.post('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return extractObject(response.data)
}

export async function logout() {
  try {
    await http.post('/auth/logout')
  } catch {
    // Ignore logout API failures and clear local session regardless.
  }
}

export async function fetchCollection(resource) {
  const response = await http.get(`/${resource}`)
  return extractArray(response.data)
}

export async function createResource(resource, payload) {
  const response = await http.post(`/${resource}`, payload)
  return extractObject(response.data)
}

export async function updateResource(resource, id, payload) {
  const response = await http.put(`/${resource}/${id}`, payload)
  return extractObject(response.data)
}

export async function deleteResource(resource, id) {
  await http.delete(`/${resource}/${id}`)
}
