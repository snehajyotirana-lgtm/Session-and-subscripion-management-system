import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import {
  AUTH_STORAGE_KEY,
  fetchCurrentUser,
  getApiErrorMessage,
  login as loginRequest,
  logout as logoutRequest,
} from '../services/api'

const AuthContext = createContext(undefined)

function persistSession(token, user) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }))
}

function clearPersistedSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

function readPersistedSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const resetSession = useCallback(() => {
    setUser(null)
    setToken(null)
    clearPersistedSession()
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      const stored = readPersistedSession()
      if (!stored.token) {
        setIsBootstrapping(false)
        return
      }

      try {
        const currentUser = await fetchCurrentUser(stored.token)
        setToken(stored.token)
        setUser(currentUser)
        persistSession(stored.token, currentUser)
      } catch {
        resetSession()
      } finally {
        setIsBootstrapping(false)
      }
    }

    void restoreSession()
  }, [resetSession])

  useEffect(() => {
    const handleUnauthorized = () => {
      resetSession()
      toast.error('Your session expired. Please sign in again.')
    }

    window.addEventListener('cspms:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('cspms:unauthorized', handleUnauthorized)
  }, [resetSession])

  const login = useCallback(async (credentials) => {
    const session = await loginRequest(credentials)
    setToken(session.token)
    setUser(session.user)
    persistSession(session.token, session.user)
    toast.success(`Welcome back, ${session.user.name.split(' ')[0] || 'there'}.`)
  }, [])

  const updateUser = useCallback(
    (nextUser) => {
      setUser(nextUser)
      if (token) {
        persistSession(token, nextUser)
      }
    },
    [token],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      resetSession()
    }
  }, [resetSession])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login,
      logout,
      updateUser,
    }),
    [isBootstrapping, login, logout, token, updateUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
