import { create } from 'zustand'
import { redirect } from 'react-router-dom'

interface AuthState {
  isLoggedIn: boolean
  username: string
  login: (username: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  username: '',
  login: (username) => set({ isLoggedIn: true, username }),
  logout: () => set({ isLoggedIn: false, username: '' })
}))

// ============ 路由守卫 Loader ============
// 在数据路由中，loader 是保护路由的最佳位置
// 未登录时 redirect() 直接中断渲染，跳转登录页

export function requireAuthLoader() {
  const { isLoggedIn } = useAuthStore.getState()
  if (!isLoggedIn) {
    return redirect('/demo/router/login')
  }
  return null
}
