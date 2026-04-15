import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  getUsers,
  getPostsByUser,
  getTodos,
  createTodo,
  deleteTodo,
  getPostsPaginated
} from '../../../api/user'
import type { Post, Todo } from '../../../types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography

const postColumns: ColumnsType<Post> = [
  { title: 'ID', dataIndex: 'id', width: 50 },
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '内容', dataIndex: 'body', ellipsis: true }
]

// ============ 场景一：useQuery 基础 + 依赖查询 ============

const QueryBasicSection = () => {
  const [selectedUserId, setSelectedUserId] = useState<number>(1)

  // useQuery：获取用户列表，staleTime=5min 内不重新请求
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000
  })

  // useQuery：依赖查询 — queryKey 包含 selectedUserId
  // enabled 为 true 时才发请求；切换 userId → queryKey 变化 → 自动重新请求
  const {
    data: posts = [],
    isLoading: postsLoading,
    isFetching: postsFetching,
    refetch: refetchPosts,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['posts', selectedUserId], // key 含依赖值，切换时自动触发
    queryFn: () => getPostsByUser(selectedUserId),
    enabled: !!selectedUserId // false 时暂停请求
  })

  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
    staleTime: 5 * 60 * 1000 // 5分钟内认为数据是新鲜的
  })

  return (
    <Row gutter={[16, 16]}>
      {/* 统计卡 */}
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
          title="依赖查询（enabled + queryKey 含依赖值）"
          extra={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              loading={postsFetching}
              onClick={() => refetchPosts()}
            >
              手动 refetch
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
              message={`queryKey: ['posts', ${selectedUserId}] — 切换用户时 key 变化自动重新请求，相同 key 命中缓存`}
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
    </Row>
  )
}

// ============ 场景二：useMutation + 乐观更新 ============

const MutationSection = () => {
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState('')

  // useQuery 获取 todos，作为 mutation 操作的目标列表
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos-mut'], // 单独的 key，和上面的 todos 隔离
    queryFn: getTodos
  })

  // useMutation：新增 Todo，含乐观更新
  const createMutation = useMutation({
    mutationFn: (title: string) => createTodo(title),

    // onMutate：mutation 发出前调用——在这里做乐观更新
    onMutate: async (title) => {
      // 1. 取消正在进行的同 key 查询（避免竞态覆盖乐观数据）
      await queryClient.cancelQueries({ queryKey: ['todos-mut'] })
      // 2. 保存旧数据，出错时用来回滚
      const prev = queryClient.getQueryData<Todo[]>(['todos-mut'])
      // 3. 立即往缓存写入临时数据（UI 立刻响应）
      queryClient.setQueryData<Todo[]>(['todos-mut'], (old = []) => [
        { id: -Date.now(), title, completed: false, userId: 1 },
        ...old
      ])
      return { prev } // 返回 context，onError 中用
    },

    // onError：请求失败时用 context 回滚乐观数据
    onError: (_err, _title, context) => {
      queryClient.setQueryData(['todos-mut'], context?.prev)
    },

    // onSettled：成功或失败都重新拉取，保证和服务端同步
    // （JSONPlaceholder 不真正持久化，所以会看到列表恢复原状）
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-mut'] })
    }
  })

  // useMutation：删除 Todo（含乐观更新）
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos-mut'] })
      const prev = queryClient.getQueryData<Todo[]>(['todos-mut'])
      // 立即从缓存中移除该条目，UI 即时响应
      queryClient.setQueryData<Todo[]>(['todos-mut'], (old = []) =>
        old.filter((t) => t.id !== id)
      )
      return { prev }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['todos-mut'], context?.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-mut'] })
    }
  })

  const todoColumns: ColumnsType<Todo> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '任务', dataIndex: 'title', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'completed',
      width: 80,
      render: (v) => (
        <Tag color={v ? 'success' : 'default'}>{v ? '完成' : '待做'}</Tag>
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_, record) => (
        <Button
          size="small"
          danger
          loading={
            deleteMutation.isPending && deleteMutation.variables === record.id
          }
          onClick={() => deleteMutation.mutate(record.id)}
          icon={<DeleteOutlined />}
        />
      )
    }
  ]

  return (
    <Card
      title="useMutation + 乐观更新 + invalidateQueries"
      style={{ borderRadius: 8 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="乐观更新：请求发出前先更新 UI，出错时自动回滚；onSettled 中 invalidateQueries 重新拉取保持同步"
          type="warning"
          showIcon
        />

        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="输入任务标题"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={() => {
              if (newTitle.trim()) {
                createMutation.mutate(newTitle.trim())
                setNewTitle('')
              }
            }}
          />
          <Button
            type="primary"
            loading={createMutation.isPending}
            disabled={!newTitle.trim()}
            onClick={() => {
              createMutation.mutate(newTitle.trim())
              setNewTitle('')
            }}
          >
            新增
          </Button>
        </Space.Compact>

        {createMutation.isError && (
          <Alert
            message={`新增失败: ${(createMutation.error as Error).message}`}
            type="error"
            showIcon
          />
        )}

        <Spin spinning={isLoading}>
          <Table
            size="small"
            dataSource={todos}
            columns={todoColumns}
            rowKey="id"
            pagination={{ pageSize: 5, size: 'small' }}
            rowClassName={(r) => (r.id < 0 ? 'optimistic-row' : '')}
          />
        </Spin>
        <Text type="secondary" style={{ fontSize: 12 }}>
          * JSONPlaceholder 不真正持久化，invalidateQueries
          后列表会恢复原状——这正好演示了乐观更新→失效→重新拉取的完整流程
        </Text>
      </Space>
    </Card>
  )
}

// ============ 场景三：useInfiniteQuery 无限滚动 ============

const InfiniteSection = () => {
  // useInfiniteQuery：分页加载，每次 fetchNextPage 自动带入下一页参数
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['posts-infinite'],
      queryFn: ({ pageParam }) => getPostsPaginated(pageParam as number),
      // initialPageParam：第一次请求用的 pageParam 值
      initialPageParam: 1,
      // getNextPageParam：从上一页结果推算下一页参数
      // 返回 undefined 表示没有更多页
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 8 ? allPages.length + 1 : undefined
    })

  // data.pages 是二维数组，flatMap 展平成一维列表
  const allPosts = data?.pages.flatMap((page) => page) ?? []

  const infiniteColumns: ColumnsType<Post> = [
    { title: 'ID', dataIndex: 'id', width: 50 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '内容', dataIndex: 'body', ellipsis: true }
  ]

  return (
    <Card
      title="useInfiniteQuery 分页加载"
      style={{ borderRadius: 8 }}
      extra={<Text type="secondary">已加载 {allPosts.length} 条</Text>}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="useInfiniteQuery 把多页数据存在 data.pages（数组的数组），getNextPageParam 决定下一页参数"
          type="info"
          showIcon
        />
        <Spin spinning={isLoading}>
          <Table
            size="small"
            dataSource={allPosts}
            columns={infiniteColumns}
            rowKey="id"
            pagination={false}
          />
        </Spin>
        <div style={{ textAlign: 'center' }}>
          <Button
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            disabled={!hasNextPage}
          >
            {hasNextPage ? '加载更多' : '已加载全部'}
          </Button>
        </div>
      </Space>
    </Card>
  )
}

// ============ 主页面 ============

const QueryDemo: React.FC = () => {
  return (
    <div>
      <Title level={3}>React Query + Axios 服务端状态</Title>
      <Paragraph>
        <Tag color="red">useQuery</Tag>
        <Tag color="red">useMutation</Tag>
        <Tag color="red">useInfiniteQuery</Tag>
        <Tag color="red">invalidateQueries</Tag>
        自动缓存、重试、后台刷新、乐观更新，无需手动管理 loading/error 状态。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {/* 场景一：useQuery + 依赖查询 */}
        <Card
          type="inner"
          title="场景一：useQuery — staleTime 缓存 / enabled 依赖查询 / 手动 refetch"
          style={{ borderRadius: 8 }}
        >
          <QueryBasicSection />
        </Card>

        {/* 场景二：useMutation + 乐观更新 */}
        <Card
          type="inner"
          title="场景二：useMutation — 增删改 / 乐观更新 / invalidateQueries"
          style={{ borderRadius: 8 }}
        >
          <MutationSection />
        </Card>

        {/* 场景三：useInfiniteQuery */}
        <Card
          type="inner"
          title="场景三：useInfiniteQuery — 分页加载 / 无限滚动"
          style={{ borderRadius: 8 }}
        >
          <InfiniteSection />
        </Card>
      </Space>
    </div>
  )
}

export default QueryDemo
