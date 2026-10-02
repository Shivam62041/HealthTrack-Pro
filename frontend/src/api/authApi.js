import axiosInstance from './axiosInstance'

export const authApi = {
  register: async (data) => {
    const res = await axiosInstance.post('/api/auth/register', data)
    return res.data
  },
  login: async (data) => {
    const res = await axiosInstance.post('/api/auth/login', data)
    return res.data
  },
  refresh: async (refreshToken) => {
    const res = await axiosInstance.post('/api/auth/refresh', { refreshToken })
    return res.data
  },
  forgotPassword: async (email) => {
    const res = await axiosInstance.post('/api/auth/forgot-password', { email })
    return res.data
  },
}
