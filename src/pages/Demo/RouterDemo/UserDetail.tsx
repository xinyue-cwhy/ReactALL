import { USERS } from './data'

const { Text, Paragraph } = Typography

// ============ useParams：从 URL 中读取动态参数 ============

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const user = USERS.find((u) => u.id === Number(id))

  return (
    <div>
      {/* 说明：useParams */}
      <Alert
        style={{ marginBottom: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>useParams：</Text>
            路由 <Text code>users/:id</Text> 中的 <Text code>:id</Text> 通过{' '}
            <Text code>{`const { id } = useParams()`}</Text> 读取。 当前读到：
            <Text code>id = &quot;{id}&quot;</Text>
          </Text>
        }
      />

      {/* 返回按钮 */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回上一页
        </Button>
        <Button onClick={() => navigate('/demo/router/users')}>
          返回用户列表
        </Button>
      </Space>

      {!user ? (
        <Alert
          type="error"
          showIcon
          message={`用户 ID=${id} 不存在`}
          description={
            <Text style={{ fontSize: 12 }}>
              这是动态路由的边界情况：URL 中的 id 在数据里找不到。
              生产项目中应跳转到 404 或展示错误状态。
            </Text>
          }
          action={
            <Button
              size="small"
              danger
              onClick={() => navigate('/demo/router/users')}
            >
              返回列表
            </Button>
          }
        />
      ) : (
        <Card size="small" style={{ borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {/* 头像 */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#e6f4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 24,
                fontWeight: 700,
                color: '#1677ff'
              }}
            >
              {user.name[0]}
            </div>

            {/* 详情 */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 18 }}>
                  {user.name}
                </Text>
                <Tag color="blue" style={{ marginLeft: 10 }}>
                  {user.role}
                </Tag>
                <Tag>{user.level}</Tag>
                <Tag color={user.status === 'active' ? 'success' : 'default'}>
                  {user.status === 'active' ? '在职' : '离职'}
                </Tag>
              </div>

              <Space direction="vertical" size={4}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Text strong>ID：</Text>
                  {user.id}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Text strong>邮箱：</Text>
                  {user.email}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Text strong>入职时间：</Text>
                  {user.joined}
                </Text>
              </Space>
            </div>
          </div>
        </Card>
      )}

      {/* useLocation 展示 */}
      <Card
        title="useLocation 返回值"
        size="small"
        style={{ borderRadius: 8, marginTop: 12 }}
      >
        <Paragraph type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
          <Text code>useLocation()</Text> 返回当前路由的完整位置对象：
        </Paragraph>
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
          <code>
            {JSON.stringify(
              {
                pathname: location.pathname,
                search: location.search,
                hash: location.hash,
                state: location.state,
                key: location.key
              },
              null,
              2
            )}
          </code>
        </pre>
      </Card>

      {/* 前后导航 */}
      {user && (
        <Space style={{ marginTop: 12 }}>
          <Button
            disabled={user.id <= 1}
            onClick={() => navigate(`/demo/router/users/${user.id - 1}`)}
          >
            ← 上一位（ID {user.id - 1}）
          </Button>
          <Button
            disabled={user.id >= USERS.length}
            onClick={() => navigate(`/demo/router/users/${user.id + 1}`)}
          >
            下一位（ID {user.id + 1}）→
          </Button>
        </Space>
      )}
    </div>
  )
}

export default UserDetail
