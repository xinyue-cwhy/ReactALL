import { useAuthStore } from './authStore'

// ============ 路由守卫说明页 ============
// 展示鉴权状态 + 提供导航入口

const { Text, Paragraph } = Typography

const GuardDemo: React.FC = () => {
  const { isLoggedIn, username, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div>
      <Alert
        style={{ marginBottom: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>路由守卫（鉴权跳转）：</Text>
            在受保护路由的 <Text code>loader</Text> 中检测登录态， 未登录则{' '}
            <Text code>return redirect('/login')</Text>，无需包装组件，
            无渲染闪烁。
          </Text>
        }
      />

      {/* 当前状态 */}
      <Card
        size="small"
        style={{ borderRadius: 8, marginBottom: 12 }}
        title="当前登录状态"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag
            color={isLoggedIn ? 'success' : 'default'}
            style={{ fontSize: 13 }}
          >
            {isLoggedIn ? `已登录：${username}` : '未登录'}
          </Tag>
          {isLoggedIn && (
            <Button size="small" danger onClick={logout}>
              退出登录
            </Button>
          )}
        </div>
      </Card>

      {/* 体验入口 */}
      <Card
        size="small"
        title="体验路由守卫"
        style={{ borderRadius: 8, marginBottom: 12 }}
      >
        <Space wrap>
          <Button
            type="primary"
            onClick={() => navigate('/demo/router/protected')}
          >
            访问受保护页面
          </Button>
          <Button onClick={() => navigate('/demo/router/login')}>
            前往登录页
          </Button>
        </Space>
        <Alert
          style={{ marginTop: 10 }}
          type="info"
          showIcon
          message={
            <Text style={{ fontSize: 12 }}>
              {isLoggedIn
                ? '当前已登录，点击"访问受保护页面"可直接进入。'
                : '当前未登录，点击"访问受保护页面"会被守卫拦截并跳转到登录页。'}
            </Text>
          }
        />
      </Card>

      {/* 两种守卫方案对比 */}
      <Card title="两种守卫方案对比" size="small" style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* 方案一 */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <Tag color="orange" style={{ marginBottom: 8 }}>
              方案一：组件包裹（RequireAuth）
            </Tag>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px 14px',
                borderRadius: 6,
                fontSize: 11,
                lineHeight: 1.65,
                margin: 0
              }}
            >
              <code>{`// RequireAuth.tsx
const RequireAuth = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const location = useLocation()
  if (!isLoggedIn) {
    return <Navigate
      to="/login"
      state={{ from: location.pathname }}
      replace
    />
  }
  return <Outlet />
}

// router.tsx
{
  element: <RequireAuth />,
  children: [
    { path: 'protected', element: <ProtectedPage /> }
  ]
}`}</code>
            </pre>
            <Text type="secondary" style={{ fontSize: 11 }}>
              简单直观，适合大多数场景；先渲染再跳转，有轻微闪烁风险。
            </Text>
          </div>

          {/* 方案二 */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <Tag color="blue" style={{ marginBottom: 8 }}>
              方案二：loader 守卫（本 Demo 使用）
            </Tag>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px 14px',
                borderRadius: 6,
                fontSize: 11,
                lineHeight: 1.65,
                margin: 0
              }}
            >
              <code>{`// authStore.ts
export function requireAuthLoader() {
  const { isLoggedIn } = useAuthStore.getState()
  if (!isLoggedIn) {
    return redirect('/demo/router/login')
  }
  return null
}

// router.tsx
{
  path: 'protected',
  loader: requireAuthLoader,  // 渲染前检查
  element: <ProtectedPage />,
}`}</code>
            </pre>
            <Text type="secondary" style={{ fontSize: 11 }}>
              渲染前拦截，无闪烁，与数据预加载组合使用更自然。
            </Text>
          </div>
        </div>

        <Paragraph
          type="secondary"
          style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}
        >
          两种方案都可行，<Text strong>loader 方式</Text>是 React Router v7
          数据路由的推荐模式；
          <Text strong>RequireAuth 组件</Text>在不使用数据路由时更通用。
        </Paragraph>
      </Card>
    </div>
  )
}

export default GuardDemo
