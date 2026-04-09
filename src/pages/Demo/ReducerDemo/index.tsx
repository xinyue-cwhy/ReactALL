const { Title, Text, Paragraph } = Typography

// ============ 场景1：useReducer 基础 - TodoList ============

type Filter = 'all' | 'active' | 'done'

interface Todo {
  id: number
  text: string
  done: boolean
}

interface Snapshot {
  todos: Todo[]
  nextId: number
}

interface TodoState {
  todos: Todo[]
  filter: Filter
  nextId: number
  history: Snapshot[] // 历史快照栈，每次可逆操作前压入
}

type TodoAction =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DELETE'; id: number }
  | { type: 'SET_FILTER'; filter: Filter }
  | { type: 'CLEAR_DONE' }
  | { type: 'UNDO' }

const todoInitial: TodoState = {
  todos: [
    { id: 1, text: '学习 useReducer 基础', done: true },
    { id: 2, text: '搭配 Context 替代 Redux', done: false },
    { id: 3, text: '自定义 Hook 封装', done: false }
  ],
  filter: 'all',
  nextId: 4,
  history: []
}

// 压入快照，最多保留 10 步
function pushHistory(state: TodoState): TodoState['history'] {
  return [...state.history, { todos: state.todos, nextId: state.nextId }].slice(
    -10
  )
}

// ★ Reducer：纯函数，接收旧 state + action，返回新 state
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: state.nextId, text: action.text, done: false }
        ],
        nextId: state.nextId + 1,
        history: pushHistory(state)
      }
    case 'TOGGLE':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t
        ),
        history: pushHistory(state)
      }
    case 'DELETE':
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.id),
        history: pushHistory(state)
      }
    case 'SET_FILTER':
      return { ...state, filter: action.filter } // 切换视图，不计入历史
    case 'CLEAR_DONE':
      return {
        ...state,
        todos: state.todos.filter((t) => !t.done),
        history: pushHistory(state)
      }
    case 'UNDO': {
      if (state.history.length === 0) return state
      const prev = state.history[state.history.length - 1]
      return {
        ...state,
        todos: prev.todos,
        nextId: prev.nextId,
        history: state.history.slice(0, -1) // 弹出栈顶
      }
    }
    default:
      return state
  }
}

const TodoDemo: React.FC = () => {
  const [state, dispatch] = useReducer(todoReducer, todoInitial)
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    dispatch({ type: 'ADD', text })
    setInput('')
  }

  const filtered = state.todos.filter((t) => {
    if (state.filter === 'active') return !t.done
    if (state.filter === 'done') return t.done
    return true
  })

  const doneCount = state.todos.filter((t) => t.done).length

  return (
    <Card
      title="useReducer 基础 — TodoList"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        多种 action 类型（增/删/切换/筛选/清空），用 useReducer 统一管理状态
      </Paragraph>

      {/* 输入 */}
      <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleAdd}
          placeholder="输入待办事项，按 Enter 添加"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加
        </Button>
      </Space.Compact>

      {/* 筛选 + 清空已完成 + 撤销 */}
      <Space style={{ marginBottom: 12 }} wrap>
        {(['all', 'active', 'done'] as Filter[]).map((f) => (
          <Button
            key={f}
            size="small"
            type={state.filter === f ? 'primary' : 'default'}
            onClick={() => dispatch({ type: 'SET_FILTER', filter: f })}
          >
            {f === 'all' ? '全部' : f === 'active' ? '未完成' : '已完成'}
          </Button>
        ))}
        <Button
          size="small"
          danger
          icon={<ClearOutlined />}
          disabled={doneCount === 0}
          onClick={() => dispatch({ type: 'CLEAR_DONE' })}
        >
          清空已完成（{doneCount}）
        </Button>
        <Button
          size="small"
          icon={<UndoOutlined />}
          disabled={state.history.length === 0}
          onClick={() => dispatch({ type: 'UNDO' })}
        >
          撤销（{state.history.length}）
        </Button>
      </Space>

      {/* 列表 */}
      <div style={{ minHeight: 80 }}>
        {filtered.length === 0 ? (
          <Text type="secondary">暂无数据</Text>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 0',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => dispatch({ type: 'TOGGLE', id: t.id })}
                style={{ cursor: 'pointer' }}
              />
              <Text
                style={{
                  flex: 1,
                  textDecoration: t.done ? 'line-through' : 'none',
                  color: t.done ? '#bbb' : undefined
                }}
              >
                {t.text}
              </Text>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => dispatch({ type: 'DELETE', id: t.id })}
              />
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
            <Text strong>useReducer vs useState：</Text>
            当状态有多个子字段、多种更新逻辑时，useReducer
            更清晰——所有更新集中在 reducer 函数里，action 名称就是文档。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景2：useReducer + Context 替代 Redux ============

interface CartItem {
  id: number
  name: string
  price: number
  qty: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; item: Omit<CartItem, 'qty'> }
  | { type: 'REMOVE'; id: number }
  | { type: 'SET_QTY'; id: number; qty: number }
  | { type: 'CLEAR' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.find((i) => i.id === action.item.id)
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
          )
        }
      }
      return { items: [...state.items, { ...action.item, qty: 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) }
    case 'SET_QTY':
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
        )
      }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

// Context：分离 state 和 dispatch，避免 dispatch 引用变化导致不必要重渲染
const CartStateCtx = createContext<CartState>({ items: [] })
const CartDispatchCtx = createContext<React.Dispatch<CartAction>>(() => {})

const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  return (
    <CartStateCtx.Provider value={state}>
      <CartDispatchCtx.Provider value={dispatch}>
        {children}
      </CartDispatchCtx.Provider>
    </CartStateCtx.Provider>
  )
}

const useCartState = () => useContext(CartStateCtx)
const useCartDispatch = () => useContext(CartDispatchCtx)

const products = [
  { id: 1, name: 'React 实战书', price: 89 },
  { id: 2, name: 'TypeScript 深入', price: 79 },
  { id: 3, name: 'Vite 构建工具', price: 59 },
  { id: 4, name: 'Node.js 后端', price: 99 }
]

// 商品列表：只关心 dispatch，不订阅 state → 不受购物车变化影响重渲染
const ProductList: React.FC = () => {
  const dispatch = useCartDispatch()
  return (
    <Card title="商品列表" size="small" style={{ borderRadius: 8 }}>
      {products.map((p) => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <div>
            <Text strong>{p.name}</Text>
            <Tag color="orange" style={{ marginLeft: 8 }}>
              ¥{p.price}
            </Tag>
          </div>
          <Button
            size="small"
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => dispatch({ type: 'ADD', item: p })}
          >
            加入购物车
          </Button>
        </div>
      ))}
    </Card>
  )
}

// 购物车面板：只关心 state
const CartPanel: React.FC = () => {
  const { items } = useCartState()
  const dispatch = useCartDispatch()

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <Card
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>购物车</span>
          <Tag color="blue">{items.length} 种商品</Tag>
        </Space>
      }
      size="small"
      style={{ borderRadius: 8 }}
      extra={
        <Button size="small" danger onClick={() => dispatch({ type: 'CLEAR' })}>
          清空
        </Button>
      }
    >
      {items.length === 0 ? (
        <Text type="secondary">购物车为空，快去挑选商品吧～</Text>
      ) : (
        <>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 0',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <Text style={{ flex: 1 }}>{item.name}</Text>
              <Text type="secondary">¥{item.price}</Text>
              <InputNumber
                size="small"
                min={1}
                max={99}
                value={item.qty}
                style={{ width: 60 }}
                onChange={(v) =>
                  v && dispatch({ type: 'SET_QTY', id: item.id, qty: v })
                }
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => dispatch({ type: 'REMOVE', id: item.id })}
              />
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 12,
              paddingTop: 8,
              borderTop: '2px solid #1677ff20'
            }}
          >
            <Text strong>合计</Text>
            <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
              ¥{total}
            </Text>
          </div>
        </>
      )}
      <Alert
        style={{ marginTop: 12 }}
        type="success"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>Context 拆分技巧：</Text>将 state 和 dispatch 分成两个
            Context，纯展示组件只订阅 state，纯操作组件只拿
            dispatch，避免无关重渲染。
          </Text>
        }
      />
    </Card>
  )
}

const CartContextDemo: React.FC = () => (
  <CartProvider>
    <Row gutter={[16, 0]}>
      <Col xs={24} md={12}>
        <ProductList />
      </Col>
      <Col xs={24} md={12}>
        <CartPanel />
      </Col>
    </Row>
  </CartProvider>
)

// ============ 页面 ============
const ReducerDemo: React.FC = () => (
  <div>
    <Title level={3}>useReducer 复杂状态</Title>
    <Paragraph>
      <Tag color="purple">useReducer</Tag>{' '}
      适合管理有多个子字段、多种更新逻辑的复杂状态。 搭配{' '}
      <Tag color="green">Context</Tag> 可在组件树中共享，效果类似轻量级 Redux。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <TodoDemo />
      </Col>
      <Col xs={24} lg={12}>
        <Card
          title="useReducer + Context 购物车"
          size="small"
          style={{ borderRadius: 8 }}
        >
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            CartProvider 内部用 useReducer 管理购物车状态，通过 Context
            下发给子组件
          </Paragraph>
          <CartContextDemo />
        </Card>
      </Col>
    </Row>
  </div>
)

export default ReducerDemo
