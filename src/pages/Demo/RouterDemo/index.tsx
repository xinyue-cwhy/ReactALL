const { Title, Text, Paragraph } = Typography

// ============ 导航 Tab ============

const navItems = [
  {
    to: '/demo/router/users',
    label: '用户列表',
    desc: 'useSearchParams + useNavigate'
  },
  { to: '/demo/router/settings', label: '设置', desc: 'useLocation' },
  { to: '/demo/router/guard', label: '路由守卫', desc: 'loader + redirect' }
]

const navStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 20px',
  borderRadius: 6,
  background: isActive ? '#1677ff' : '#f5f5f5',
  color: isActive ? '#fff' : '#595959',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: `1px solid ${isActive ? '#1677ff' : '#e8e8e8'}`
})

// ============ 页面 ============

const RouterDemo: React.FC = () => {
  const location = useLocation()

  return (
    <div>
      <Title level={3}>React Router v7：嵌套路由 / 动态路由</Title>
      <Paragraph>
        本 Demo 演示嵌套路由（<Text code>Outlet</Text>）、动态路由（
        <Text code>:id</Text>）及四个常用 Hook：
        <Text code>useNavigate</Text> / <Text code>useSearchParams</Text> /{' '}
        <Text code>useLocation</Text> / <Text code>useParams</Text>。
      </Paragraph>

      {/* URL 实时显示 */}
      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 13 }}>
            当前路径：
            <Text code style={{ fontSize: 13 }}>
              {location.pathname}
              {location.search}
            </Text>
            &nbsp;—— 切换路由时这里会实时更新
          </Text>
        }
      />

      {/* 嵌套导航 */}
      <Space style={{ marginBottom: 12 }}>
        {navItems.map(({ to, label, desc }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => navStyle(isActive)}
          >
            <Text
              strong
              style={{ fontSize: 13, color: 'inherit', lineHeight: 1.4 }}
            >
              {label}
            </Text>
            <Text style={{ fontSize: 11, color: 'inherit', opacity: 0.8 }}>
              {desc}
            </Text>
          </NavLink>
        ))}
        <div
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            background: '#fff2e8',
            border: '1px solid #ffbb96',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Text strong style={{ fontSize: 13, color: '#d4380d' }}>
            用户详情
          </Text>
          <Text style={{ fontSize: 11, color: '#d4380d', opacity: 0.8 }}>
            useParams（点击用户行进入）
          </Text>
        </div>
      </Space>

      {/* Outlet 区域 */}
      <div
        style={{
          border: '2px dashed #d9d9d9',
          borderRadius: 8,
          padding: '16px',
          minHeight: 300,
          position: 'relative'
        }}
      >
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            position: 'absolute',
            top: 8,
            right: 12
          }}
        >
          {'<Outlet />'}
        </Text>
        <Outlet />
      </div>

      {/* 嵌套路由配置说明 */}
      <Card
        title="嵌套路由配置"
        size="small"
        style={{ borderRadius: 8, marginTop: 16 }}
      >
        <pre
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '14px 16px',
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.65,
            overflowX: 'auto',
            margin: 0
          }}
        >
          <code>{`// router/index.tsx
{
  path: 'demo/router',
  element: withSuspense(RouterDemo),   // 父路由：渲染 <Outlet />
  children: [
    { index: true, element: <Navigate to="/demo/router/users" replace /> },
    { path: 'users',     element: withSuspense(UserList)   },  // /demo/router/users
    { path: 'users/:id', element: withSuspense(UserDetail) },  // /demo/router/users/3
    { path: 'settings',  element: withSuspense(Settings)   },  // /demo/router/settings
  ]
}`}</code>
        </pre>
        <Alert
          style={{ marginTop: 10 }}
          type="info"
          showIcon
          message={
            <Text style={{ fontSize: 12 }}>
              父路由渲染 <Text code>{'<Outlet />'}</Text>
              ，子路由的内容会替换进去。
              <Text code>index: true</Text> 表示访问父路径时默认显示的子路由。
            </Text>
          }
        />
      </Card>
    </div>
  )
}

export default RouterDemo
