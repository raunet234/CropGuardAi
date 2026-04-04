import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
})

export const getWeather = (city) => api.get(`/api/weather?city=${encodeURIComponent(city)}`)
export const getMarket = (state, crop) => api.get(`/api/market?state=${encodeURIComponent(state || '')}&crop=${encodeURIComponent(crop || '')}`)
export const chatWithAI = (messages, language) => api.post('/api/ai/chat', { messages, language })
export const getCropRecommendation = (params) => api.post('/api/ai/crop-recommend', params)
export const detectDisease = (imageBase64) => api.post('/api/ai/disease', { image: imageBase64 })
export const getGuideline = (module, topic) => api.post('/api/ai/guideline', { module, topic })
export const getSchemeDetail = (scheme) => api.post('/api/ai/scheme-detail', { scheme })
export const getCommunityPosts = () => api.get('/api/community/posts')
export const createPost = (data) => api.post('/api/community/posts', data)
export const createReply = (data) => api.post('/api/community/reply', data)
export const getReplies = (postId) => api.get(`/api/community/replies/${postId}`)
export const getHistory = (userId) => api.get(`/api/history/${userId}`)
export const saveHistory = (data) => api.post('/api/history', data)
export const deleteHistory = (userId) => api.delete(`/api/history/${userId}`)
export const getProfile = (userId) => api.get(`/api/profile/${userId}`)
export const updateProfile = (userId, data) => api.put(`/api/profile/${userId}`, data)

export default api
