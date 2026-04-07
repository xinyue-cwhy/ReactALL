import axios from 'axios'

const request = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可在此处添加 token
    // config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('请求错误:', error.message)
    return Promise.reject(error)
  }
)

export default request
