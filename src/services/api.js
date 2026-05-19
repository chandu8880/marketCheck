import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min — analysis takes time
})

export async function runAnalysis() {
  const response = await api.post('/api/analyze')
  return response.data
}

export async function checkHealth() {
  const response = await api.get('/api/health')
  return response.data
}
