import axiosInstance from './axiosInstance'

export const adminApi = {
  getStats: async () => {
    const res = await axiosInstance.get('/api/admin/stats')
    return res.data
  },
  getUsers: async (search = '', page = 0, size = 20) => {
    const res = await axiosInstance.get('/api/admin/users', { params: { search, page, size } })
    return res.data
  },
  disableUser: async (id) => {
    const res = await axiosInstance.patch(`/api/admin/users/${id}/disable`)
    return res.data
  },
  activateUser: async (id) => {
    const res = await axiosInstance.patch(`/api/admin/users/${id}/activate`)
    return res.data
  },
}
