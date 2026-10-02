import axiosInstance from './axiosInstance'

export const goalsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/api/goals')
    return res.data
  },
  create: async (data) => {
    const res = await axiosInstance.post('/api/goals', data)
    return res.data
  },
  update: async (id, data) => {
    const res = await axiosInstance.put(`/api/goals/${id}`, data)
    return res.data
  },
  updateProgress: async (id, progress) => {
    const res = await axiosInstance.patch(`/api/goals/${id}/progress`, { progress })
    return res.data
  },
  delete: async (id) => {
    await axiosInstance.delete(`/api/goals/${id}`)
  },
}
