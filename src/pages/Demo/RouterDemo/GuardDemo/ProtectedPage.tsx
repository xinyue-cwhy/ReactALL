import { useAuthStore } from './authStore'

// ============ 受保护页面 ============
// 只有登录后才能访问（requireAuthLoader 把关）

const { Text, Paragraph } = Typography

const ProtectedPage: React.FC = () => {
  const { username, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/demo/router/guard', { replace: true })
  }

  return (
    <div>
      <Alert
        style={{ marginBottom: 12 }}
        type="success"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>鉴权通过！</Text>
            你已登录为 <Text code>{username}</Text>，
            <Text code>requireAuthLoader</Text> 检测到{' '}
            <Text code>isLoggedIn = true</Text>，放行渲染本页。
          </Text>
        }
      />

      <Card size="small" style={{ borderRadius: 8, marginBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '12px 0'
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#f6ffed',
              border: '2px solid #52c41a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: '#52c41a',
              flexShrink: 0
            }}
          >
            {username[0]?.toUpperCase()}
          </div>
          <div>
            <Text strong style={{ fontSize: 16 }}>
              {username}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              会员专区 · 已登录
            </Text>
          </div>
          <Button danger onClick={handleLogout} style={{ marginLeft: 'auto' }}>
            退出登录
          </Button>
        </div>
      </Card>

      <Card title="当前 Zustand 状态" size="small" style={{ borderRadius: 8 }}>
        <pre
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '12px 14px',
            borderRadius: 6,
            fontSize: 12,
            lineHeight: 1.65,
            margin: 0
          }}
        >
          <code>{JSON.stringify({ isLoggedIn: true, username }, null, 2)}</code>
        </pre>
        <Paragraph
          type="secondary"
          style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}
        >
          退出登录后再次访问本页，<Text code>requireAuthLoader</Text> 检测到{' '}
          <Text code>isLoggedIn = false</Text>，自动重定向到登录页。
        </Paragraph>
      </Card>
    </div>
  )
}

export default ProtectedPage
