const { Title, Text, Paragraph } = Typography

// ============ 自定义 Hook 集合 ============

// ★ useFetch：封装 fetch + loading/error + AbortController 取消
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<T>
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return // 组件卸载时取消，不更新状态
        setError(err.message)
        setLoading(false)
      })

    return () => controller.abort() // 清理函数：组件卸载 or url 变化时取消上一次请求
  }, [url])

  return { data, loading, error }
}

// ★ useLocalStorage：读写 localStorage，自动序列化 / 反序列化
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        localStorage.setItem(key, JSON.stringify(resolved))
        return resolved
      })
    },
    [key]
  )

  const remove = useCallback(() => {
    localStorage.removeItem(key)
    setValue(initialValue)
  }, [key, initialValue])

  return [value, set, remove] as const
}

// ★ useDebounce：对 value 防抖，delay 毫秒内不更新
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer) // 每次 value / delay 变化时清掉上一个计时器
  }, [value, delay])

  return debounced
}

// ★ useToggle：布尔开关
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((v) => !v), [])
  const setTrue = useCallback(() => setOn(true), [])
  const setFalse = useCallback(() => setOn(false), [])
  return { on, toggle, setTrue, setFalse }
}

// ★ useCounter：带最大/最小值限制的计数器
function useCounter(initial = 0, { min = -Infinity, max = Infinity } = {}) {
  const [count, setCount] = useState(initial)
  const inc = useCallback(() => setCount((c) => Math.min(c + 1, max)), [max])
  const dec = useCallback(() => setCount((c) => Math.max(c - 1, min)), [min])
  const reset = useCallback(() => setCount(initial), [initial])
  return { count, inc, dec, reset }
}

// ============ 场景1：useFetch ============

interface Post {
  id: number
  title: string
  body: string
}

const FetchDemo: React.FC = () => {
  const [postId, setPostId] = useState(1)
  const { data, loading, error } = useFetch<Post>(
    `https://jsonplaceholder.typicode.com/posts/${postId}`
  )

  return (
    <Card title="useFetch — 数据请求" size="small" style={{ borderRadius: 8 }}>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        封装 fetch + loading / error 状态 + AbortController 取消竞态
      </Paragraph>

      <Space style={{ marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((id) => (
          <Button
            key={id}
            size="small"
            type={postId === id ? 'primary' : 'default'}
            onClick={() => setPostId(id)}
          >
            Post {id}
          </Button>
        ))}
      </Space>

      {loading && <Spin size="small" />}
      {error && <Alert type="error" message={`请求失败：${error}`} showIcon />}
      {data && !loading && (
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: 6,
            padding: 12,
            marginTop: 8
          }}
        >
          <Text strong>#{data.id} </Text>
          <Text>{data.title}</Text>
          <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
            {data.body}
          </Paragraph>
        </div>
      )}

      <Alert
        style={{ marginTop: 12 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>关键点：</Text>
            切换 postId 时，上一次请求会被 AbortController
            取消，避免旧数据覆盖新数据（竞态问题）。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景2：useLocalStorage ============

interface Note {
  text: string
  color: string
}

const LocalStorageDemo: React.FC = () => {
  const [notes, setNotes, clearNotes] = useLocalStorage<Note[]>(
    'demo-notes',
    []
  )
  const [input, setInput] = useState('')
  const colors = ['#fff9c4', '#c8e6c9', '#bbdefb', '#f8bbd9', '#e1bee7']

  const addNote = () => {
    const text = input.trim()
    if (!text) return
    const color = colors[Math.floor(Math.random() * colors.length)]
    setNotes((prev) => [...prev, { text, color }])
    setInput('')
  }

  const removeNote = (i: number) =>
    setNotes((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <Card
      title="useLocalStorage — 持久化存储"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        数据存入 localStorage，刷新页面后仍然保留
      </Paragraph>

      <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={addNote}
          placeholder="写一条便签，刷新页面试试"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={addNote}>
          添加
        </Button>
      </Space.Compact>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          minHeight: 60,
          marginBottom: 8
        }}
      >
        {notes.length === 0 ? (
          <Text type="secondary">暂无便签，添加一条试试～</Text>
        ) : (
          notes.map((n, i) => (
            <div
              key={i}
              style={{
                background: n.color,
                borderRadius: 8,
                padding: '8px 12px',
                position: 'relative',
                maxWidth: 160,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              <Text style={{ fontSize: 13 }}>{n.text}</Text>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  minWidth: 0,
                  padding: 0
                }}
                onClick={() => removeNote(i)}
              />
            </div>
          ))
        )}
      </div>

      {notes.length > 0 && (
        <Button size="small" danger onClick={clearNotes}>
          清空所有便签
        </Button>
      )}

      <Alert
        style={{ marginTop: 12 }}
        type="success"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>关键点：</Text>
            用函数式 initializer（useState 接受函数）确保 localStorage
            只读一次，避免每次渲染都读取。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景3：useDebounce ============

const DebounceDemo: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  const debounced = useDebounce(keyword, 500)
  const [searchLog, setSearchLog] = useState<string[]>([])

  useEffect(() => {
    if (!debounced) return
    setSearchLog((prev) => [`搜索: "${debounced}"`, ...prev.slice(0, 4)])
  }, [debounced])

  return (
    <Card title="useDebounce — 防抖" size="small" style={{ borderRadius: 8 }}>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        输入停止 500ms 后才触发"搜索"，避免每次击键都发请求
      </Paragraph>

      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="输入关键词（500ms 防抖）"
        style={{ marginBottom: 12 }}
      />

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          实时值：<Text code>{keyword || '(空)'}</Text>
          {'  '}防抖值：
          <Text code style={{ color: '#1677ff' }}>
            {debounced || '(空)'}
          </Text>
        </Text>
      </div>

      <div style={{ minHeight: 80 }}>
        {searchLog.length === 0 ? (
          <Text type="secondary">防抖后的触发记录会显示在这里</Text>
        ) : (
          searchLog.map((log, i) => (
            <div key={i} style={{ padding: '2px 0', fontSize: 13 }}>
              <Text type={i === 0 ? undefined : 'secondary'}>{log}</Text>
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
            <Text strong>关键点：</Text>
            每次 value 变化时 clearTimeout 清掉上一个计时器，只有在 delay
            时间内没有新变化时才更新 debounced 值。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景4：useToggle + useCounter ============

const ToggleCounterDemo: React.FC = () => {
  const modal = useToggle()
  const { count, inc, dec, reset } = useCounter(0, { min: 0, max: 10 })

  return (
    <Card
      title="useToggle + useCounter — 语义化封装"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        把重复的状态逻辑提取成 Hook，组件代码更语义化、更易复用
      </Paragraph>

      {/* useToggle */}
      <div style={{ marginBottom: 16 }}>
        <Text strong>useToggle（弹层开关）</Text>
        <div style={{ marginTop: 8 }}>
          <Space>
            <Button type="primary" onClick={modal.toggle}>
              {modal.on ? '关闭' : '打开'} Modal
            </Button>
            <Button onClick={modal.setFalse} disabled={!modal.on}>
              强制关闭
            </Button>
          </Space>
          {modal.on && (
            <Alert
              style={{ marginTop: 8 }}
              type="warning"
              showIcon
              message="模拟 Modal 已打开"
              closable
              onClose={modal.setFalse}
            />
          )}
        </div>
      </div>

      {/* useCounter */}
      <div>
        <Text strong>useCounter（0 ≤ count ≤ 10）</Text>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <Button
            onClick={dec}
            disabled={count <= 0}
            icon={<MinusOutlined />}
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: 700,
              minWidth: 40,
              textAlign: 'center'
            }}
          >
            {count}
          </Text>
          <Button
            onClick={inc}
            disabled={count >= 10}
            icon={<PlusOutlined />}
            type="primary"
          />
          <Button size="small" onClick={reset}>
            重置
          </Button>
        </div>
        {count === 10 && (
          <Text
            type="warning"
            style={{ fontSize: 12, display: 'block', marginTop: 4 }}
          >
            已达最大值 10
          </Text>
        )}
      </div>

      <Alert
        style={{ marginTop: 12 }}
        type="success"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>自定义 Hook 三原则：</Text>① 以 use 开头（React 规则）②
            只能在函数组件 / 其他 Hook 中调用 ③ 每次调用得到独立状态实例
          </Text>
        }
      />
    </Card>
  )
}

// ============ 页面 ============
const CustomHookDemo: React.FC = () => (
  <div>
    <Title level={3}>自定义 Hook 封装</Title>
    <Paragraph>
      <Tag color="blue">自定义 Hook</Tag> 是以 <Text code>use</Text>{' '}
      开头的普通函数，内部可以调用其他 Hook，用于
      <Text strong>抽离可复用的状态逻辑</Text>，让组件代码更简洁、更语义化。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <FetchDemo />
      </Col>
      <Col xs={24} lg={12}>
        <LocalStorageDemo />
      </Col>
      <Col xs={24} lg={12}>
        <DebounceDemo />
      </Col>
      <Col xs={24} lg={12}>
        <ToggleCounterDemo />
      </Col>
    </Row>
  </div>
)

export default CustomHookDemo
