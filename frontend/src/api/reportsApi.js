import axiosInstance from './axiosInstance'

export const reportsApi = {
  downloadPdf: async () => {
    const res = await axiosInstance.get('/api/reports/pdf', { responseType: 'blob' })
    return res.data
  },
  getSummary: async () => {
    const res = await axiosInstance.get('/api/reports/summary')
    return res.data
  },
}
