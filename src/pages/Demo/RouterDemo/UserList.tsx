import { USERS } from './data'
import type { User } from './data'

const { Text } = Typography

const roleColors: Record<string, string> = {
  前端: 'blue',
  后端: 'green',
  全栈: 'purple',
  算法: 'orange'
}

// ============ useSearchParams：把搜索条件存到 URL ============
// 好处：刷新页面、分享链接都能还原搜索状态

const UserList: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // 从 URL 读取搜索词，默认空字符串
  const query = searchParams.get('q') ?? ''
  const roleFilter = searchParams.get('role') ?? ''

  const filtered = USERS.filter((u: User) => {
    const matchName = u.name.includes(query) || u.email.includes(query)
    const matchRole = roleFilter ? u.role === roleFilter : true
    return matchName && matchRole
  })

  const handleSearch = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val) next.set('q', val)
      else next.delete('q')
      return next
    })
  }

  const handleRoleFilter = (role: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (role) next.set('role', role)
      else next.delete('role')
      console.log(next, 'next')

      return next
    })
  }

  return (
    <div>
      {/* 说明：useSearchParams */}
      <Alert
        style={{ marginBottom: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>useSearchParams：</Text>
            搜索词存入 URL（<Text code>?q=xxx&role=前端</Text>
            ），刷新页面或分享链接后搜索状态得以保留。
          </Text>
        }
      />

      {/* 搜索栏 */}
      <Space style={{ marginBottom: 12 }} wrap>
        <Input
          placeholder="搜索姓名 / 邮箱"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: 200 }}
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
        />
        {(['', '前端', '后端', '全栈', '算法'] as const).map((role) => (
          <Tag
            key={role || 'all'}
            color={
              role
                ? roleFilter === role
                  ? roleColors[role]
                  : undefined
                : roleFilter === ''
                  ? 'blue'
                  : undefined
            }
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => handleRoleFilter(role)}
          >
            {role || '全部'}
          </Tag>
        ))}
        <Text type="secondary" style={{ fontSize: 12 }}>
          共 {filtered.length} 条
        </Text>
      </Space>

      {/* 用户列表 */}
      <div
        style={{
          border: '1px solid #f0f0f0',
          borderRadius: 6,
          overflow: 'hidden'
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <Text type="secondary">无匹配结果</Text>
          </div>
        ) : (
          filtered.map((u: User, i: number) => (
            <div
              key={u.id}
              onClick={() => navigate(`/demo/router/users/${u.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                gap: 12,
                borderBottom:
                  i < filtered.length - 1 ? '1px solid #f5f5f5' : 'none',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = '#fafafa')
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#e6f4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Text strong style={{ color: '#1677ff', fontSize: 13 }}>
                  {u.name[0]}
                </Text>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div>
                  <Text strong style={{ fontSize: 13 }}>
                    {u.name}
                  </Text>
                  <Tag
                    color={roleColors[u.role]}
                    style={{ marginLeft: 8, fontSize: 11 }}
                  >
                    {u.role}
                  </Tag>
                  <Tag style={{ fontSize: 11 }}>{u.level}</Tag>
                  <Tag
                    color={u.status === 'active' ? 'success' : 'default'}
                    style={{ fontSize: 11 }}
                  >
                    {u.status === 'active' ? '在职' : '离职'}
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {u.email}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
                → /users/{u.id}
              </Text>
            </div>
          ))
        )}
      </div>

      <Alert
        style={{ marginTop: 12 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>useNavigate：</Text>点击用户行执行{' '}
            <Text code>{`navigate('/demo/router/users/:id')`}</Text>
            ，跳转到动态路由。
          </Text>
        }
      />
    </div>
  )
}

export default UserList
