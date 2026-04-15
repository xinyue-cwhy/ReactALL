import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch'
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
  setStep,
  selectCounterStats
} from '../../../store/slices/counterSlice'
import {
  fetchUsers,
  selectUser,
  clearSelected
} from '../../../store/slices/userSlice'
import {
  addTask,
  toggleTask,
  removeTask,
  clearCompleted,
  selectAllTasks,
  selectTaskCount
} from '../../../store/slices/taskSlice'
import type { User } from '../../../types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography

const columns: ColumnsType<User> = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '姓名', dataIndex: 'name' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '网站', dataIndex: 'website', render: (v) => v || '-' }
]

// ─── 场景一：Counter Slice（同步操作）────────────────────────────────────────

const CounterSection = () => {
  // useAppDispatch：带类型的 dispatch，等价于 useDispatch<AppDispatch>()
  // 直接用 useDispatch 会丢失 Thunk 的类型推断
  const dispatch = useAppDispatch()

  // useAppSelector：只订阅 counter slice
  // user slice 变化时此组件不会重渲染
  const { value, step, history } = useAppSelector((s) => s.counter)

  // createSelector：记忆化派生数据
  // value 不变 → selectCounterStats 不重新计算，直接返回缓存
  const { isEven, isPositive, squared, abs } =
    useAppSelector(selectCounterStats)

  return (
    <Card
      title={
        <>
          <ThunderboltOutlined /> createSlice（同步）
        </>
      }
      style={{ borderRadius: 8, height: '100%' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 当前值 */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 56,
            fontWeight: 700,
            color: '#722ed1',
            lineHeight: 1
          }}
        >
          {value}
        </div>

        {/* 操作按钮：每次 dispatch 都产生新的 action 对象发往 store */}
        <Space wrap>
          <Button
            icon={<MinusOutlined />}
            onClick={() => dispatch(decrement())}
          >
            -{step}
          </Button>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => dispatch(increment())}
          >
            +{step}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            danger
            onClick={() => dispatch(reset())}
          >
            重置
          </Button>
        </Space>

        {/* setStep：dispatch 带 payload 的 action */}
        <Space>
          <Text>步长:</Text>
          <InputNumber
            min={1}
            max={100}
            value={step}
            onChange={(v) => dispatch(setStep(v ?? 1))}
          />
          {/* incrementByAmount：PayloadAction<number> */}
          <Button onClick={() => dispatch(incrementByAmount(10))}>+10</Button>
        </Space>

        {/* createSelector 派生数据 */}
        <Divider dashed>createSelector 派生状态（记忆化）</Divider>
        <Row gutter={8}>
          {[
            {
              label: '奇偶',
              value: isEven ? '偶数' : '奇数',
              color: isEven ? 'blue' : 'orange'
            },
            {
              label: '正负',
              value: isPositive ? '正数' : value === 0 ? '零' : '负数',
              color: isPositive ? 'green' : 'red'
            },
            { label: '绝对值', value: abs, color: 'purple' },
            { label: '平方', value: squared, color: 'cyan' }
          ].map((item) => (
            <Col span={12} key={item.label} style={{ marginBottom: 8 }}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.label}
                </Text>
                <div>
                  <Tag color={item.color}>{item.value}</Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 操作历史 */}
        <Divider dashed>操作历史</Divider>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {history.map((v, i) => (
            <Tag
              key={i}
              color={i === history.length - 1 ? 'purple' : 'default'}
            >
              {v}
            </Tag>
          ))}
        </div>
      </Space>
    </Card>
  )
}

// ─── 场景二：User Slice + createAsyncThunk（异步操作）────────────────────────

const UserSection = () => {
  const dispatch = useAppDispatch()
  const { list, loading, error, selected } = useAppSelector((s) => s.users)

  const statusMsg = loading
    ? '⏳ pending：请求进行中'
    : list.length
      ? `✅ fulfilled：已加载 ${list.length} 条`
      : error
        ? '❌ rejected：请求失败'
        : '点击按钮触发 fetchUsers() Thunk'

  const statusType = error
    ? 'error'
    : loading
      ? 'warning'
      : list.length
        ? 'success'
        : 'info'

  return (
    <Card
      title="createAsyncThunk（异步）"
      extra={
        <Button
          size="small"
          type="primary"
          loading={loading}
          onClick={() => dispatch(fetchUsers())}
          // dispatch(thunk) → 自动派发 pending → fulfilled / rejected
        >
          拉取用户
        </Button>
      }
      style={{ borderRadius: 8, height: '100%' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* createAsyncThunk 状态机：pending→loading=true，settled→loading=false */}
        <Alert message={statusMsg} type={statusType} showIcon={false} />

        {error && <Alert message={error} type="error" showIcon />}

        {selected && (
          <Alert
            message={
              <>
                已选中: <Text strong>{selected.name}</Text> — {selected.email}
                <Button
                  size="small"
                  type="link"
                  onClick={() => dispatch(clearSelected())}
                >
                  清除
                </Button>
              </>
            }
            type="info"
            showIcon
          />
        )}

        <Spin spinning={loading}>
          <Table
            size="small"
            dataSource={list.slice(0, 5)}
            columns={columns}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => dispatch(selectUser(record))
            })}
            locale={{ emptyText: '点击上方按钮加载数据' }}
          />
        </Spin>

        {list.length > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            点击行可选中用户（selectUser action）
          </Text>
        )}
      </div>
    </Card>
  )
}

// ─── 场景三：createEntityAdapter（归一化状态）────────────────────────────────

const TaskSection = () => {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector(selectAllTasks)
  const total = useAppSelector(selectTaskCount)
  const [input, setInput] = useState('')

  const done = tasks.filter((t) => t.completed).length

  const handleAdd = () => {
    const title = input.trim()
    if (!title) return
    // prepare callback 在这里自动执行：addTask('买菜') → { id: uuid, title: '买菜', completed: false }
    dispatch(addTask(title))
    setInput('')
  }

  return (
    <Card
      title={
        <>
          <DatabaseOutlined /> createEntityAdapter（归一化状态）
        </>
      }
      extra={
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {done}/{total} 完成
          </Text>
          <Button
            size="small"
            danger
            disabled={done === 0}
            onClick={() => dispatch(clearCompleted())}
          >
            清除已完成
          </Button>
        </Space>
      }
      style={{ borderRadius: 8 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* prepare callback：dispatch(addTask('标题')) → prepare('标题') → 自动附加 id */}
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="新任务标题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleAdd}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加
          </Button>
        </Space.Compact>

        {/* 展示归一化 state 结构 */}
        <Divider dashed>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {'state.tasks: { ids: [...], entities: { [id]: Task } }'}
          </Text>
        </Divider>

        {/* selectAll → 按 ids 顺序返回 Task[]，O(1) 查找 */}
        <List
          size="small"
          dataSource={tasks}
          locale={{ emptyText: '暂无任务，输入后回车添加' }}
          renderItem={(task) => (
            <List.Item
              actions={[
                // toggleTask：直接 mutation entities[id].completed（Immer）
                <Switch
                  size="small"
                  checked={task.completed}
                  onChange={() => dispatch(toggleTask(task.id))}
                  checkedChildren="✓"
                  unCheckedChildren="○"
                />,
                // removeTask = adapter.removeOne：从 ids 和 entities 中同步删除
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => dispatch(removeTask(task.id))}
                />
              ]}
            >
              <Text
                delete={task.completed}
                type={task.completed ? 'secondary' : undefined}
                style={{ fontSize: 13 }}
              >
                {task.title}
              </Text>
            </List.Item>
          )}
        />
      </Space>
    </Card>
  )
}

// ─── 主页面 ──────────────────────────────────────────────────────────────────

const ReduxDemo: React.FC = () => {
  return (
    <div>
      <Title level={3}>Redux Toolkit 全局状态</Title>
      <Paragraph>
        <Tag color="purple">createSlice</Tag>
        <Tag color="purple">createAsyncThunk</Tag>
        <Tag color="purple">createSelector</Tag>
        <Tag color="purple">createEntityAdapter</Tag>
        <Tag color="purple">useSelector</Tag>
        <Tag color="purple">useDispatch</Tag>
        所有组件共享同一 store；组件只描述"发生了什么"（dispatch action），store
        决定"状态怎么变"（reducer）。
      </Paragraph>

      <Alert
        style={{ marginBottom: 16 }}
        message="Redux 单向数据流"
        description={
          <Text style={{ fontFamily: 'monospace' }}>
            UI → dispatch(action) → reducer(state, action) → new state →
            useSelector → UI 重渲染
          </Text>
        }
        type="info"
        showIcon
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <CounterSection />
        </Col>
        <Col xs={24} md={12}>
          <UserSection />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <TaskSection />
        </Col>
      </Row>
    </div>
  )
}

export default ReduxDemo
