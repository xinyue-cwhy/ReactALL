import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { theme } from 'antd'
import { useTheme } from '../../context/ThemeContext'

const { Header, Sider, Content, Footer } = Layout
const { Text } = Typography

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页'
  },
  {
    key: 'communication',
    icon: <SwapOutlined />,
    label: '组件通信',
    children: [
      {
        key: '/demo/props',
        icon: <NodeIndexOutlined />,
        label: 'Props 父子通信'
      },
      {
        key: '/demo/context',
        icon: <GlobalOutlined />,
        label: 'Context 跨层通信'
      },
      { key: '/demo/ref', icon: <RetweetOutlined />, label: 'Ref 命令式通信' },
      {
        key: '/demo/eventbus',
        icon: <ApiOutlined />,
        label: 'EventBus 发布订阅'
      }
    ]
  },
  {
    key: 'hooks',
    icon: <BulbOutlined />,
    label: 'Hooks 深入',
    children: [
      { key: '/demo/form', icon: <ToolOutlined />, label: '受控表单' },
      {
        key: '/demo/effect',
        icon: <BulbOutlined />,
        label: 'useEffect 副作用'
      },
      {
        key: '/demo/reducer',
        icon: <FunctionOutlined />,
        label: 'useReducer 复杂状态'
      },
      {
        key: '/demo/custom-hook',
        icon: <CodeOutlined />,
        label: '自定义 Hook'
      },
      {
        key: '/demo/concurrent',
        icon: <ThunderboltOutlined />,
        label: 'useTransition / useDeferredValue'
      }
    ]
  },
  {
    key: 'perf',
    icon: <StarOutlined />,
    label: '性能优化',
    children: [
      {
        key: '/demo/memo',
        icon: <StarOutlined />,
        label: 'memo / useMemo / useCallback'
      },
      {
        key: '/demo/render',
        icon: <ReloadOutlined />,
        label: '渲染可视化'
      },
      {
        key: '/demo/lazy',
        icon: <SplitCellsOutlined />,
        label: 'lazy + Suspense 代码分割'
      },
      {
        key: '/demo/virtual',
        icon: <UnorderedListOutlined />,
        label: '虚拟列表'
      }
    ]
  },
  {
    key: 'router',
    icon: <BranchesOutlined />,
    label: '路由进阶',
    children: [
      {
        key: '/demo/router/users',
        icon: <TeamOutlined />,
        label: '嵌套 / 动态路由'
      },
      {
        key: '/demo/loader',
        icon: <CloudDownloadOutlined />,
        label: 'loader / action'
      },
      {
        key: '/demo/router/guard',
        icon: <EyeInvisibleOutlined />,
        label: '路由守卫'
      }
    ]
  },
  {
    key: 'state',
    icon: <ThunderboltOutlined />,
    label: '状态管理',
    children: [
      {
        key: '/demo/redux',
        icon: <ThunderboltOutlined />,
        label: 'Redux 全局状态'
      },
      {
        key: '/demo/zustand',
        icon: <ShareAltOutlined />,
        label: 'Zustand 状态管理'
      }
    ]
  },
  {
    key: 'data',
    icon: <DatabaseOutlined />,
    label: '数据请求',
    children: [
      {
        key: '/demo/query',
        icon: <DatabaseOutlined />,
        label: 'React Query + Axios'
      }
    ]
  },
  {
    key: 'react19',
    icon: <ReloadOutlined />,
    label: 'React 19 新特性',
    children: [
      {
        key: '/demo/suspense',
        icon: <ReloadOutlined />,
        label: 'React Suspense'
      }
    ]
  },
  {
    key: 'complex-form',
    icon: <ToolOutlined />,
    label: '复杂表单',
    children: [
      {
        key: '/demo/booking-form',
        icon: <ToolOutlined />,
        label: '酒店预订单'
      }
    ]
  }
]

const breadcrumbMap: Record<string, string> = {
  '/': '首页',
  '/demo/props': 'Props 父子通信',
  '/demo/context': 'Context 跨层通信',
  '/demo/redux': 'Redux 全局状态',
  '/demo/zustand': 'Zustand 状态管理',
  '/demo/ref': 'Ref 命令式通信',
  '/demo/eventbus': 'EventBus 发布订阅',
  '/demo/query': 'React Query + Axios',
  '/demo/suspense': 'React Suspense',
  '/demo/form': '受控表单',
  '/demo/effect': 'useEffect 副作用',
  '/demo/reducer': 'useReducer 复杂状态',
  '/demo/custom-hook': '自定义 Hook',
  '/demo/concurrent': '并发渲染',
  '/demo/memo': '性能优化 memo',
  '/demo/render': '渲染可视化',
  '/demo/lazy': 'lazy + Suspense 代码分割',
  '/demo/virtual': '虚拟列表',
  '/demo/router/users': '嵌套 / 动态路由',
  '/demo/router/settings': '嵌套 / 动态路由',
  '/demo/loader': 'loader / action',
  '/demo/router/guard': '路由守卫',
  '/demo/router/login': '路由守卫 · 登录',
  '/demo/router/protected': '路由守卫 · 受保护页面',
  '/demo/booking-form': '酒店预订单'
}

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { theme: appTheme } = useTheme()
  const { token } = theme.useToken()

  const isDark = appTheme === 'dark'
  const segments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = [
    { title: '首页' },
    ...segments.map((_, i) => ({
      title:
        breadcrumbMap['/' + segments.slice(0, i + 1).join('/')] || segments[i]
    }))
  ]

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={isDark ? 'dark' : 'light'}
        style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}
      >
        <div
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* Logo - 吸顶 */}
          <div
            style={{
              height: 64,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: token.colorPrimary
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: collapsed ? 12 : 16
              }}
            >
              {collapsed ? 'RF' : 'React 全家桶'}
            </Text>
          </div>

          {/* 首页 - 吸顶 */}
          <Menu
            theme={isDark ? 'dark' : 'light'}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={[menuItems[0]]}
            onClick={({ key }) => navigate(key)}
            style={{ flexShrink: 0 }}
          />

          {/* 分类菜单 - 可滚动 */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Menu
              theme={isDark ? 'dark' : 'light'}
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={[
                'communication',
                'hooks',
                'perf',
                'router',
                'state',
                'data',
                'react19',
                'complex-form'
              ]}
              items={menuItems.slice(1)}
              onClick={({ key }) => navigate(key)}
            />
          </div>
        </div>
      </Sider>
      {/* 右侧内容 */}
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Breadcrumb items={breadcrumbs} />
          <Space>
            <Badge dot>
              <Avatar
                icon={<UserOutlined />}
                style={{ background: token.colorPrimary }}
              />
            </Badge>
            <Text strong>React 全家桶 Demo</Text>
          </Space>
        </Header>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Content
            style={{
              padding: 24,
              background: token.colorBgContainer,
              minHeight: 360
            }}
          >
            <Outlet />
          </Content>

          <Footer
            style={{ textAlign: 'center', color: token.colorTextSecondary }}
          >
            React + Vite + TypeScript 全家桶演示 &copy;{' '}
            {new Date().getFullYear()}
          </Footer>
        </div>
      </Layout>
    </Layout>
  )
}

export default AppLayout
