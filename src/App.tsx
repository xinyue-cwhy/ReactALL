import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, App as AntApp, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { store } from './store'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { UserProvider } from './context/UserContext'
import router from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// 内部组件：读取 ThemeContext 配置 Ant Design
const ThemedApp: React.FC = () => {
  const { theme: appTheme, primaryColor } = useTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: appTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: primaryColor },
      }}
    >
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  )
}

const App: React.FC = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <ThemedApp />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
)

export default App
