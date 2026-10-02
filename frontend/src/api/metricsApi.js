import axiosInstance from './axiosInstance'

export const metricsApi = {
  getAll: async (startDate, endDate) => {
    const params = {}
    if (startDate) params.start = startDate
    if (endDate) params.end = endDate
    const res = await axiosInstance.get('/api/metrics', { params })
    return res.data
  },
  create: async (data) => {
    const res = await axiosInstance.post('/api/metrics', data)
    return res.data
  },
  update: async (id, data) => {
    const res = await axiosInstance.put(`/api/metrics/${id}`, data)
    return res.data
  },
  delete: async (id) => {
    await axiosInstance.delete(`/api/metrics/${id}`)
  },
}
