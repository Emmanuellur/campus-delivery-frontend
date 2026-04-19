import axios from 'axios'

const API = axios.create({ baseURL: 'https://campus-delivery-backend-a6u4.onrender.com/api' })
API.interceptors.request.use(req => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export const login    = (data) => API.post('/auth/login', data)
export const register = (data) => API.post('/auth/register', data)
export const getShops = ()     => API.get('/shops')
export const getShop  = (id)   => API.get(`/shops/${id}`)
export const placeOrder   = (data) => API.post('/orders', data)
export const getOrders    = ()     => API.get('/orders')
export const getOrder     = (id)   => API.get(`/orders/${id}`)
export const updateStatus = (id, data) => API.patch(`/orders/${id}/status`, data)