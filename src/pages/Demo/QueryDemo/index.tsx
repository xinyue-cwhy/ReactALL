import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsers, getPostsByUser, getTodos } from '../../../api/user'
import type { Post, Todo } from '../../../types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography

const postColumns: ColumnsType<Post> = [
  { title: 'ID', dataIndex: 'id', width: 50 },
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '内容', dataIndex: 'body', ellipsis: true }
]

const todoColumns: ColumnsType<Todo> = [
  { title: 'ID', dataIndex: 'id', width: 50 },
  { title: '任务', dataIndex: 'title', ellipsis: true },
  {
    title: '状态',
    dataIndex: 'completed',
    width: 80,
    render: (v) => (
      <Tag color={v ? 'success' : 'default'}>{v ? '完成' : '待做'}</Tag>
    )
  }
]

const QueryDemo: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number>(1)

  // useQuery - 获取用户列表
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000 // 5分钟内不重新请求
  })

  // useQuery - 根据 userId 获取帖子（依赖查询）
  const {
    data: posts = [],
    isLoading: postsLoading,
    isFetching: postsFetching,
    refetch: refetchPosts,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['posts', selectedUserId],
    queryFn: () => getPostsByUser(selectedUserId),
    enabled: !!selectedUserId
  })

  // useQuery - 获取 todos
  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos
  })

  return (
    <div>
      <Title level={3}>React Query + Axios 服务端状态</Title>
      <Paragraph>
        <Tag color="red">useQuery</Tag>
        <Tag color="red">queryKey</Tag>
        <Tag color="red">staleTime</Tag>
        <Tag color="red">enabled</Tag>
        自动缓存、重试、后台刷新、依赖请求，无需手动管理 loading/error。
      </Paragraph>

      <Row gutter={[16, 16]}>
        {/* 统计 */}
        <Col xs={8}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="用户数"
              value={users.length}
              prefix={<DatabaseOutlined />}
              loading={usersLoading}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="帖子数"
              value={posts.length}
              loading={postsLoading}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="待办完成率"
              value={
                todos.length
                  ? Math.round(
                      (todos.filter((t) => t.completed).length / todos.length) *
                        100
                    )
                  : 0
              }
              suffix="%"
              loading={todosLoading}
            />
          </Card>
        </Col>

        {/* 依赖查询 */}
        <Col span={24}>
          <Card
            title="依赖查询 (enabled)"
            extra={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                loading={postsFetching}
                onClick={() => refetchPosts()}
              >
                手动刷新
              </Button>
            }
            style={{ borderRadius: 8 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text>选择用户:</Text>
                <Select
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  loading={usersLoading}
                  style={{ width: 200 }}
                  options={users.map((u) => ({ value: u.id, label: u.name }))}
                />
                {dataUpdatedAt > 0 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    更新于: {new Date(dataUpdatedAt).toLocaleTimeString()}
                  </Text>
                )}
              </Space>

              <Alert
                message={`queryKey: ['posts', ${selectedUserId}] — 切换用户时自动重新请求，相同 key 使用缓存`}
                type="info"
                showIcon
              />

              <Spin spinning={postsLoading || postsFetching}>
                <Table
                  size="small"
                  dataSource={posts.slice(0, 5)}
                  columns={postColumns}
                  rowKey="id"
                  pagination={false}
                />
              </Spin>
            </Space>
          </Card>
        </Col>

        {/* Todos */}
        <Col span={24}>
          <Card
            title="Todos（staleTime: 5min 缓存）"
            style={{ borderRadius: 8 }}
          >
            <Spin spinning={todosLoading}>
              <Table
                size="small"
                dataSource={todos}
                columns={todoColumns}
                rowKey="id"
                pagination={{ pageSize: 5, size: 'small' }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default QueryDemo
