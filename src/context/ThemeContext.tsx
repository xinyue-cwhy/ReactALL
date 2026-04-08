import { useCallback } from 'react'
import type { FC, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  primaryColor: string
}

// ============ 优化前：单个 Context，所有消费者全量重渲染 ============
// const ThemeContext = createContext<ThemeContextType>({
//   theme: 'light',
//   toggleTheme: () => {},
//   primaryColor: '#1677ff'
// })
//
// export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
//   const [theme, setTheme] = useState<Theme>('light')
//
//   const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
//
//   const primaryColor = theme === 'light' ? '#1677ff' : '#4096ff'
//
//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme, primaryColor }}>
//       {children}
//     </ThemeContext.Provider>
//   )
// }
//
// export const useTheme = () => useContext(ThemeContext)

// ============ 优化后：拆分 Context，方法和状态分开 ============
// 原因：方法（toggleTheme）几乎不变，状态（theme/primaryColor）会变
// 拆开后只消费方法的组件，不会因为 theme 变化而重渲染

interface ThemeValueContextType {
  theme: Theme
  primaryColor: string
}

interface ThemeActionContextType {
  toggleTheme: () => void
}

// 状态 Context —— theme 变化时，消费此 Context 的组件重渲染
const ThemeValueContext = createContext<ThemeValueContextType>({
  theme: 'light',
  primaryColor: '#1677ff'
})

// 方法 Context —— toggleTheme 引用不变，消费此 Context 的组件不会重渲染
const ThemeActionContext = createContext<ThemeActionContextType>({
  toggleTheme: () => {}
})

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light')

  // useCallback + 空依赖，保证 toggleTheme 引用永远不变
  // 这样 ThemeActionContext 的 value 不会变，消费者不重渲染
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    []
  )

  const primaryColor = theme === 'light' ? '#1677ff' : '#4096ff'

  return (
    // 方法 Context 在外层，值几乎不变
    <ThemeActionContext.Provider value={{ toggleTheme }}>
      {/* 状态 Context 在内层，theme 变化时只更新这一层 */}
      <ThemeValueContext.Provider value={{ theme, primaryColor }}>
        {children}
      </ThemeValueContext.Provider>
    </ThemeActionContext.Provider>
  )
}

// 消费状态：theme 变化时触发重渲染
export const useThemeValue = () => useContext(ThemeValueContext)

// 消费方法：toggleTheme 引用不变，不会触发重渲染
export const useThemeAction = () => useContext(ThemeActionContext)

// 兼容旧用法：同时消费状态和方法（等同于优化前，全量重渲染）
export const useTheme = (): ThemeContextType => {
  const { theme, primaryColor } = useThemeValue()
  const { toggleTheme } = useThemeAction()
  return { theme, toggleTheme, primaryColor }
}

export default ThemeValueContext
