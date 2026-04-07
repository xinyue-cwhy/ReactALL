import { useState } from "react";
import { useTheme } from '../../../context/ThemeContext'
import { useUser } from '../../../context/UserContext'
import type { User } from '../../../types'

const { Title, Text, Paragraph } = Typography

// 深层子组件 - 直接消费 Context，无需 props 传递
const DeepChild: React.FC = () => {
  const { theme, toggleTheme, primaryColor } = useTheme()
  const { currentUser, isLoggedIn, logout } = useUser()

  return (
    <Card
      size="small"
      title="深层子组件（直接使用 Context，无需 props 钻透）"
      style={{ border: `2px dashed ${primaryColor}`, borderRadius: 8 }}
    >
      <Space direction="vertical">
        <Text>当前主题: <Tag color={theme === 'dark' ? 'default' : 'blue'}>{theme}</Tag></Text>
        <Text>主题色: <span style={{ color: primaryColor, fontWeight: 700 }}>{primaryColor}</span></Text>
        <Button icon={<BulbOutlined />} onClick={toggleTheme} size="small">
          切换主题
        </Button>
        <Divider dashed style={{ margin: '8px 0' }} />
        {isLoggedIn ? (
          <Space>
            <Text>登录用户: <Text strong>{currentUser?.name}</Text></Text>
            <Button size="small" danger onClick={logout}>退出</Button>
          </Space>
        ) : (
          <Text type="secondary">未登录</Text>
        )}
      </Space>
    </Card>
  )
}

// 中间层组件 - 不关心 Context，只负责渲染
const MiddleLayer: React.FC = () => (
  <Card title="中间层组件（不关心 Context，不传 props）" size="small" style={{ borderRadius: 8 }}>
    <DeepChild />
  </Card>
)

const ContextDemo: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { isLoggedIn, login } = useUser()
  const [loginName, setLoginName] = useState('张三')

  const mockLogin = () => {
    const user: User = { id: 1, name: loginName, email: `${loginName}@example.com` }
    login(user)
  }

  return (
    <div style={{ background: theme === 'dark' ? '#141414' : '#fff', padding: 16, borderRadius: 8, transition: 'all 0.3s' }}>
      <Title level={3}>Context 跨层通信</Title>
      <Paragraph>
        使用 <Text code>createContext</Text> + <Text code>useContext</Text> + <Text code>useReducer</Text>
        实现跨层级数据共享，避免 Props Drilling（层层传递）。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Alert
            message="本页面使用两个 Context：ThemeContext（主题切换）和 UserContext（用户状态）"
            type="info"
            showIcon
          />
        </Col>

        <Col xs={24} md={12}>
          <Card title="ThemeContext 控制" style={{ borderRadius: 8 }}>
            <Space direction="vertical">
              <Space>
                <Text>当前主题: <Tag color={theme === 'dark' ? 'default' : 'blue'}>{theme}</Tag></Text>
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  checkedChildren="暗色"
                  unCheckedChildren="亮色"
                />
              </Space>
              <Text type="secondary">切换后整个页面响应变化</Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="UserContext 控制" style={{ borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {!isLoggedIn ? (
                <Space>
                  <input
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: '4px 11px' }}
                  />
                  <Button icon={<UserOutlined />} type="primary" onClick={mockLogin}>
                    模拟登录
                  </Button>
                </Space>
              ) : (
                <Alert message="已登录，查看深层子组件的效果" type="success" showIcon />
              )}
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="组件层级演示（Context 穿透）" style={{ borderRadius: 8 }}>
            <MiddleLayer />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ContextDemo
