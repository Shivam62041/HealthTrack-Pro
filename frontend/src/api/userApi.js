import axiosInstance from './axiosInstance'

export const userApi = {
  getProfile: async () => {
    const res = await axiosInstance.get('/api/users/me')
    return res.data
  },
  updateProfile: async (data) => {
    const res = await axiosInstance.put('/api/users/me', data)
    return res.data
  },
  changePassword: async (data) => {
    await axiosInstance.put('/api/users/me/password', data)
  },
  calculateBmi: async () => {
    const res = await axiosInstance.post('/api/bmi/calculate')
    return res.data
  },
  getBmiHistory: async () => {
    const res = await axiosInstance.get('/api/bmi/history')
    return res.data
  },
}
