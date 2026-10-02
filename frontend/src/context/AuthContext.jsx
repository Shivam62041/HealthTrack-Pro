import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.clear()
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updated) => {
    const merged = { ...user, ...updated }
    localStorage.setItem('user', JSON.stringify(merged))
    setUser(merged)
  }, [user])

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
