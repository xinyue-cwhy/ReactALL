const { Text, Paragraph } = Typography

// ============ useLocation：读取完整路由状态 ============

const SettingsPanel: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div>
      <Alert
        style={{ marginBottom: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>useLocation：</Text>返回当前路由的位置对象，包含
            pathname、search、hash、state、key，可用于埋点、面包屑、页面标题等场景。
          </Text>
        }
      />

      {/* location 对象展示 */}
      <Card
        title="当前 location 对象"
        size="small"
        style={{ borderRadius: 8, marginBottom: 12 }}
      >
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
          <code>
            {JSON.stringify(
              {
                pathname: location.pathname,
                search: location.search || '（空）',
                hash: location.hash || '（空）',
                state: location.state ?? null,
                key: location.key
              },
              null,
              2
            )}
          </code>
        </pre>
        <Paragraph
          type="secondary"
          style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}
        >
          <Text strong>pathname</Text> — 当前路径
          <br />
          <Text strong>search</Text> — URL 查询参数（?key=val）
          <br />
          <Text strong>hash</Text> — URL 哈希（#section）
          <br />
          <Text strong>state</Text> — 通过{' '}
          <Text code>navigate(to, {'{ state }'}</Text>) 传递的隐式数据（不在 URL
          中）
          <br />
          <Text strong>key</Text> — React Router
          内部用于区分历史记录条目的唯一标识
        </Paragraph>
      </Card>

      {/* navigate(-1) / navigate(n) */}
      <Card
        title="navigate 的几种用法"
        size="small"
        style={{ borderRadius: 8, marginBottom: 12 }}
      >
        <Space wrap>
          <Button onClick={() => navigate(-1)}>navigate(-1)&nbsp;← 后退</Button>
          <Button onClick={() => navigate(1)}>navigate(1)&nbsp;→ 前进</Button>
          <Button onClick={() => navigate('/demo/router/users')}>
            navigate('/demo/router/users')&nbsp;跳转
          </Button>
          <Button
            onClick={() =>
              navigate('/demo/router/users', { state: { from: 'settings' } })
            }
          >
            携带 state 跳转
          </Button>
        </Space>
        <Alert
          style={{ marginTop: 10 }}
          type="info"
          showIcon
          message={
            <Text style={{ fontSize: 12 }}>
              <Text code>navigate(-1)</Text> 等同于浏览器后退；
              <Text code>navigate(path, {'{ replace: true }'})</Text>{' '}
              替换历史记录（不可后退）；
              <Text code>state</Text> 可传递页面间的隐式数据，通过{' '}
              <Text code>location.state</Text> 读取。
            </Text>
          }
        />
      </Card>

      {/* 404 演示 */}
      <Card title="404 路由守卫演示" size="small" style={{ borderRadius: 8 }}>
        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 10 }}>
          本项目路由表末尾有一条{' '}
          <Text
            code
          >{`{ path: '*', element: <Navigate to="/404" replace /> }`}</Text>
          ， 匹配所有未定义路径并重定向到 404 页面。
        </Paragraph>
        <Button danger onClick={() => navigate('/this-route-does-not-exist')}>
          访问不存在的路由 → 触发 404
        </Button>
      </Card>
    </div>
  )
}

export default SettingsPanel
