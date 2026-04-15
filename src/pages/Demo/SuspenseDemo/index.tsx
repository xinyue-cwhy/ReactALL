// ============ 阶段七：React 19 新特性 ============
// 场景一：use() 读取 Promise
// 场景二：useOptimistic 乐观 UI
// 场景三：React Compiler 自动 memo 原理（概念讲解）

const { Title, Text, Paragraph } = Typography

// ── 工具函数 ──────────────────────────────────────────────────────────────────

// 模拟慢接口：1.5 秒后返回数据
function fetchUser(id: number): Promise<{ name: string; role: string }> {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          id === 1
            ? { name: 'Alice', role: '管理员' }
            : { name: 'Bob', role: '普通用户' }
        ),
      1500
    )
  })
}

// 模拟发送消息接口（50% 概率失败，演示乐观回滚）
function sendMessage(text: string): Promise<{ id: number; text: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.4) {
        resolve({ id: Date.now(), text })
      } else {
        reject(new Error('网络波动，发送失败'))
      }
    }, 1000)
  })
}

// ── 场景一：use() + Suspense ───────────────────────────────────────────────────

// UserCard 直接用 use() 读取 Promise，React 会自动暂停（throw promise）
// 直到 Promise resolve，外层 Suspense 展示 fallback
const UserCard = ({
  userPromise
}: {
  userPromise: Promise<{ name: string; role: string }>
}) => {
  // use() 是 React 19 新 API：
  // - 可在组件内任意位置调用（不是 hook，无规则限制）
  // - 读取 Promise 时，如果 Promise pending → 抛出 Promise → Suspense 接管
  // - Promise resolve 后组件重新渲染，use() 返回结果值
  const user = use(userPromise)

  return (
    <Card size="small" style={{ width: 220 }}>
      <Space>
        <Avatar icon={<UserOutlined />} />
        <div>
          <div>
            <Text strong>{user.name}</Text>
          </div>
          <Text type="secondary">{user.role}</Text>
        </div>
      </Space>
    </Card>
  )
}

const UseSection = () => {
  const [userId, setUserId] = useState(1)
  // 关键：Promise 在 state 里，切换 userId 时生成新的 Promise
  // → Suspense 重新暂停并展示 fallback
  const [userPromise, setUserPromise] = useState(() => fetchUser(userId))

  const switchUser = () => {
    const nextId = userId === 1 ? 2 : 1
    setUserId(nextId)
    setUserPromise(fetchUser(nextId)) // 新 Promise → Suspense 重新暂停
  }

  return (
    <Card title="场景一：use() 读取 Promise + Suspense" style={{ borderRadius: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message={
            <span>
              <Text code>use(promise)</Text> 让组件"暂停"直到数据就绪。
              切换用户时生成新 Promise，Suspense 重新显示 fallback。
            </span>
          }
          type="info"
          showIcon
        />

        <div
          style={{
            background: '#fafafa',
            borderRadius: 8,
            padding: 16,
            border: '1px dashed #d9d9d9'
          }}
        >
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            {'<Suspense fallback={<Spin />}>'}
          </Text>
          {/* Suspense fallback：Promise pending 时展示 */}
          <Suspense
            fallback={
              <Space>
                <Spin size="small" />
                <Text type="secondary">加载用户中…</Text>
              </Space>
            }
          >
            <UserCard userPromise={userPromise} />
          </Suspense>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            {'</Suspense>'}
          </Text>
        </div>

        <Button onClick={switchUser} icon={<ReloadOutlined />}>
          切换用户（触发重新加载）
        </Button>

        <Alert
          message={
            <div>
              <Text strong>use() vs useEffect + useState 的区别：</Text>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                <li>useEffect 方式：先渲染空状态 → effect 触发 → setState → 再次渲染</li>
                <li>
                  use() 方式：Promise pending 时直接暂停，resolve 后一次性渲染正确内容
                </li>
                <li>use() 可在条件/循环里调用（不受 Hook 规则约束）</li>
              </ul>
            </div>
          }
          type="warning"
          showIcon={false}
        />
      </Space>
    </Card>
  )
}

// ── 场景二：useOptimistic ──────────────────────────────────────────────────────

type Message = { id: number; text: string; sending?: boolean }

const OptimisticSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '大家好！' },
    { id: 2, text: '今天天气不错' }
  ])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // useOptimistic：
  // - 第一个参数：真实状态（messages）
  // - 第二个参数：乐观更新函数，返回乐观态
  // - 返回 [乐观态, 触发函数]
  // 特点：服务端请求期间显示乐观态；请求完成后自动切回真实态
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current: Message[], newText: string) => [
      ...current,
      { id: -Date.now(), text: newText, sending: true } // 临时消息，标记 sending
    ]
  )

  const handleSend = () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    setError(null)

    startTransition(async () => {
      // 立即显示乐观消息（不等服务端）
      addOptimistic(text)

      try {
        const saved = await sendMessage(text)
        // 请求成功：把真实消息写入 state（乐观态自动被真实态替换）
        setMessages((prev) => [...prev, { id: saved.id, text: saved.text }])
      } catch (e) {
        // 请求失败：乐观态自动回滚到 messages（真实态），显示错误
        setError((e as Error).message)
      }
    })
  }

  return (
    <Card title="场景二：useOptimistic 乐观 UI" style={{ borderRadius: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message={
            <span>
              <Text code>useOptimistic</Text>：发送消息时立即显示，无需等待服务端响应。
              成功后替换为真实数据；失败后自动回滚。
              <Text type="secondary">（随机 40% 概率失败，可多试几次）</Text>
            </span>
          }
          type="info"
          showIcon
        />

        {/* 消息列表 */}
        <div
          style={{
            minHeight: 160,
            maxHeight: 240,
            overflowY: 'auto',
            padding: '8px 12px',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px solid #f0f0f0'
          }}
        >
          {optimisticMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: '6px 10px',
                marginBottom: 4,
                borderRadius: 6,
                background: msg.sending ? '#fff7e6' : '#f6ffed',
                border: `1px solid ${msg.sending ? '#ffd591' : '#b7eb8f'}`,
                opacity: msg.sending ? 0.7 : 1,
                transition: 'all 0.3s'
              }}
            >
              <Space>
                {msg.sending && <Spin size="small" />}
                <Text>{msg.text}</Text>
                {msg.sending && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    发送中…
                  </Text>
                )}
              </Space>
            </div>
          ))}
        </div>

        {error && (
          <Alert
            message={`发送失败（已回滚）：${error}`}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* 输入框 */}
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="输入消息回车发送"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            disabled={isPending}
          />
          <Button
            type="primary"
            onClick={handleSend}
            loading={isPending}
            disabled={!input.trim()}
            icon={<SendOutlined />}
          >
            发送
          </Button>
        </Space.Compact>

        <Alert
          message={
            <div>
              <Text strong>useOptimistic 工作流：</Text>
              <ol style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                <li>
                  调用 <Text code>addOptimistic(text)</Text> → UI 立即显示乐观消息（橙色 "发送中"）
                </li>
                <li>服务端请求进行中，乐观态保持显示</li>
                <li>
                  成功：<Text code>setMessages</Text> 更新真实 state → 乐观态自动被替换（绿色）
                </li>
                <li>
                  失败：真实 state 未变，乐观态自动回滚，显示错误提示
                </li>
              </ol>
            </div>
          }
          type="warning"
          showIcon={false}
        />
      </Space>
    </Card>
  )
}

// ── 场景三：React Compiler 原理 ──────────────────────────────────────────────

const CompilerSection = () => (
  <Card title="场景三：React Compiler — 自动 memo 原理" style={{ borderRadius: 8 }}>
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Alert
        message="React Compiler（原名 React Forget）是 React 团队开发的 Babel 插件，在编译时自动插入 memo / useMemo / useCallback，无需手写。"
        type="info"
        showIcon
      />

      <Card size="small" title="编译前（你写的代码）">
        <pre
          style={{
            margin: 0,
            fontSize: 13,
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto'
          }}
        >
          {`function Greeting({ name }: { name: string }) {
  // 无任何 memo
  const msg = "Hello, " + name
  return <h1>{msg}</h1>
}`}
        </pre>
      </Card>

      <Card size="small" title="编译后（Compiler 自动插入）">
        <pre
          style={{
            margin: 0,
            fontSize: 13,
            background: '#f6ffed',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto'
          }}
        >
          {`// Compiler 分析依赖后自动生成：
const Greeting = memo(function Greeting({ name }: { name: string }) {
  // msg 只依赖 name，name 不变则复用缓存
  const msg = useMemo(() => "Hello, " + name, [name])
  return <h1>{msg}</h1>
})`}
        </pre>
      </Card>

      <Alert
        message={
          <div>
            <Text strong>核心原理：</Text>
            <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
              <li>
                编译器静态分析组件，找出每个值/函数的依赖项（类似 ESLint exhaustive-deps）
              </li>
              <li>自动在组件上包 memo，对计算值插入 useMemo，对回调插入 useCallback</li>
              <li>
                前提：代码必须遵守 React 规则（纯函数、Hook 规则），否则 Compiler 跳过该组件
              </li>
              <li>
                现状（2025）：已在 Meta 内部大规模使用，社区处于 RC 阶段（需 Babel 插件开启）
              </li>
            </ul>
          </div>
        }
        type="warning"
        showIcon={false}
      />

      <Alert
        message={
          <span>
            <Text strong>对你意味着什么：</Text>
            Compiler 稳定后，手写 memo / useMemo / useCallback 会大量减少。
            但理解它们的原理（阶段三内容）仍然重要——Compiler 只优化符合规则的代码，
            违反规则时你需要手动修复。
          </span>
        }
        type="success"
        showIcon
      />
    </Space>
  </Card>
)

// ── 主页面 ─────────────────────────────────────────────────────────────────────

const SuspenseDemo: React.FC = () => (
  <div>
    <Title level={3}>React 19 新特性</Title>
    <Paragraph>
      <Tag color="volcano">use()</Tag>
      <Tag color="volcano">useOptimistic</Tag>
      <Tag color="volcano">React Compiler</Tag>
      React 19 在并发模式基础上新增了更简洁的数据获取 API 和乐观更新原语。
    </Paragraph>

    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <UseSection />
      <OptimisticSection />
      <CompilerSection />
    </Space>
  </div>
)

export default SuspenseDemo
