import { useAuthStore } from './authStore'

// ============ 登录页（路由守卫 Demo 配套）============
// 模拟登录：点击后设置 Zustand 状态，navigate 到受保护页面

const { Text, Paragraph } = Typography

const LoginPage: React.FC = () => {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  // location.state.from 记录被守卫重定向前的目标页
  const from =
    (location.state as { from?: string })?.from ?? '/demo/router/protected'

  const handleLogin = async () => {
    if (!username.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600)) // 模拟登录请求
    login(username.trim())
    navigate(from, { replace: true })
  }

  return (
    <div>
      <Alert
        style={{ marginBottom: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>路由守卫 — 登录页：</Text>
            未登录时访问受保护路由，<Text code>
              requireAuthLoader
            </Text> 触发 <Text code>redirect('/demo/router/login')</Text>，携带{' '}
            <Text code>state.from</Text> 记录来源，登录后跳回原目标。
          </Text>
        }
      />

      <Card
        size="small"
        style={{ borderRadius: 8, maxWidth: 360, marginBottom: 12 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 15 }}>
            模拟登录
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            登录后将跳转至：<Text code>{from}</Text>
          </Text>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <Input
            prefix={<UserOutlined style={{ color: '#bbb' }} />}
            placeholder="输入任意用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onPressEnter={handleLogin}
            allowClear
          />
          <Button
            type="primary"
            block
            loading={loading}
            onClick={handleLogin}
            disabled={!username.trim()}
          >
            登录
          </Button>
        </Space>
      </Card>

      <Card title="守卫原理" size="small" style={{ borderRadius: 8 }}>
        <pre
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '14px 16px',
            borderRadius: 6,
            fontSize: 12,
            lineHeight: 1.65,
            margin: 0
          }}
        >
          <code>{`// authStore.ts — requireAuthLoader
export function requireAuthLoader() {
  const { isLoggedIn } = useAuthStore.getState()
  if (!isLoggedIn) {
    // redirect() 是 React Router 的工具函数
    // 在 loader 中 return redirect() 等于 HTTP 302
    return redirect('/demo/router/login')
  }
  return null  // 放行，正常渲染组件
}

// router/index.tsx — 给受保护路由挂 loader
{
  path: 'protected',
  loader: requireAuthLoader,   // 每次路由激活都会执行检查
  element: withSuspense(ProtectedPage),
}

// LoginPage.tsx — 登录成功后跳回来源页
const from = location.state?.from ?? '/demo/router/protected'
navigate(from, { replace: true })  // replace: 不留登录页历史`}</code>
        </pre>
        <Alert
          style={{ marginTop: 10 }}
          type="info"
          showIcon
          message={
            <Paragraph style={{ fontSize: 12, marginBottom: 0 }}>
              <Text strong>
                为什么用 loader 而不是 {'<RequireAuth>'} 组件？
              </Text>
              <br />
              组件方式：先渲染组件再检查鉴权，可能出现闪烁。
              <br />
              loader 方式：渲染前检查，鉴权失败直接重定向，无闪烁、体验更好。
            </Paragraph>
          }
        />
      </Card>
    </div>
  )
}

export default LoginPage
