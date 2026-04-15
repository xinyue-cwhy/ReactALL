const { Title, Text, Paragraph } = Typography

// ============ 工具 ============

function useRenderCount() {
  const count = useRef(0)
  count.current++
  return count.current
}

// 每次渲染随机一个浅色背景，直观感受"闪"的次数
function useFlashStyle() {
  const hue = useMemo(() => Math.floor(Math.random() * 360), [])
  return { background: `hsl(${hue}, 80%, 92%)`, transition: 'background 0.2s' }
}

function RenderBadge({ count }: { count: number }) {
  const color = count <= 2 ? 'green' : count <= 6 ? 'orange' : 'red'
  return (
    <Tag color={color} style={{ fontSize: 11 }}>
      渲染 {count} 次
    </Tag>
  )
}

// ============ 原因1：state 变化 ============
// 结论：setState 触发当前组件 + 所有子组件重渲染（即使子组件不依赖该 state）

function StateChild() {
  const renders = useRenderCount()
  const flash = useFlashStyle()
  return (
    <div style={{ ...flash, padding: '6px 10px', borderRadius: 6 }}>
      <Space size="small">
        <Text style={{ fontSize: 12 }}>子组件（不用 state）</Text>
        <RenderBadge count={renders} />
      </Space>
    </div>
  )
}

const StateChildMemo = memo(StateChild)

const Reason1State: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <Card title="原因1：state 变化" size="small" style={{ borderRadius: 8 }}>
      <Paragraph type="secondary" style={{ marginBottom: 10 }}>
        父组件 state 变化 → 父组件重渲染 →{' '}
        <Text strong>所有子组件默认跟着渲染</Text>，哪怕子组件根本不用这个
        state。
      </Paragraph>

      <Button
        size="small"
        style={{ marginBottom: 10 }}
        onClick={() => setCount((c) => c + 1)}
      >
        父 setState（当前: {count}）
      </Button>

      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text style={{ fontSize: 11, color: '#999' }}>普通子组件：</Text>
          <StateChild />
        </div>
        <div>
          <Text style={{ fontSize: 11, color: '#999' }}>memo 子组件：</Text>
          <StateChildMemo />
        </div>
      </Space>

      <Alert
        style={{ marginTop: 10 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>止损：</Text>用 memo 包裹子组件。memo
            子组件在父渲染时会浅比较 props，props 未变则跳过。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 原因2：props 变化（引用陷阱）============
// 结论：对象/数组/函数每次渲染都是新引用，memo 浅比较失败

const PropsChild = memo(function PropsChild({
  label,
  style: s
}: {
  label: string
  style: object
}) {
  const renders = useRenderCount()
  const flash = useFlashStyle()
  return (
    <div
      style={{
        ...flash,
        padding: '6px 10px',
        borderRadius: 6,
        border: '1px solid #d9d9d9'
      }}
    >
      <Space size="small">
        <Text style={{ fontSize: 12 }}>{label}</Text>
        <RenderBadge count={renders} />
      </Space>
    </div>
  )
})

const Reason2Props: React.FC = () => {
  const [count, setCount] = useState(0)

  // ❌ 每次渲染新建对象，引用变了
  const styleWithout = { color: 'red' }

  // ✅ useMemo 稳定引用
  const styleWith = useMemo(() => ({ color: 'red' }), [])

  return (
    <Card
      title="原因2：props 引用陷阱"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 10 }}>
        两个子组件都用 memo 包裹，props 的值相同，但一个每次新建对象，一个用
        useMemo 稳定引用。
      </Paragraph>

      <Button
        size="small"
        style={{ marginBottom: 10 }}
        onClick={() => setCount((c) => c + 1)}
      >
        父 setState（当前: {count}）
      </Button>

      <Space direction="vertical" style={{ width: '100%' }}>
        <PropsChild label="❌ 新建对象（memo 失效）" style={styleWithout} />
        <PropsChild label="✅ useMemo 稳定（memo 生效）" style={styleWith} />
      </Space>

      <Alert
        style={{ marginTop: 10 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>规律：</Text>传给 memo 子组件的 props
            中，对象/数组/函数需要用 useMemo / useCallback 稳定引用，否则 memo
            形同虚设。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 原因3：Context 变化 ============
// 结论：Context value 变化时，所有消费该 Context 的组件都会重渲染
// 止损：拆分 Context（把频繁变化的和稳定的分开）

const CountCtx = createContext(0)
const StableCtx = createContext('stable')

function ContextConsumerCount() {
  const count = useContext(CountCtx)
  const renders = useRenderCount()
  const flash = useFlashStyle()
  return (
    <div style={{ ...flash, padding: '6px 10px', borderRadius: 6 }}>
      <Space size="small">
        <Text style={{ fontSize: 12 }}>消费 CountCtx（count={count}）</Text>
        <RenderBadge count={renders} />
      </Space>
    </div>
  )
}

// memo 包裹：跳过父组件 state 变化导致的无关重渲染
// StableCtx value 从不变 → Context 也不触发渲染 → 真正隔离
const ContextConsumerStable = memo(function ContextConsumerStable() {
  const val = useContext(StableCtx)
  const renders = useRenderCount()
  const flash = useFlashStyle()
  return (
    <div style={{ ...flash, padding: '6px 10px', borderRadius: 6 }}>
      <Space size="small">
        <Text style={{ fontSize: 12 }}>消费 StableCtx（"{val}"）+ memo</Text>
        <RenderBadge count={renders} />
      </Space>
    </div>
  )
})

const Reason3Context: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <Card title="原因3：Context 变化" size="small" style={{ borderRadius: 8 }}>
      <Paragraph type="secondary" style={{ marginBottom: 10 }}>
        CountCtx 频繁变化，StableCtx 从不变。Context 拆分 + memo
        配合才能真正隔离——光拆 Context，父组件 state 变化仍会牵连子组件。
      </Paragraph>

      <CountCtx.Provider value={count}>
        <StableCtx.Provider value="stable">
          <Button
            size="small"
            style={{ marginBottom: 10 }}
            onClick={() => setCount((c) => c + 1)}
          >
            更新 CountCtx（当前: {count}）
          </Button>

          <Space direction="vertical" style={{ width: '100%' }}>
            <ContextConsumerCount />
            <ContextConsumerStable />
          </Space>
        </StableCtx.Provider>
      </CountCtx.Provider>

      <Alert
        style={{ marginTop: 10 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>结论：</Text>Context 拆分解决的是 Context
            变化导致的重渲染；父组件 state 变化导致的重渲染需要 memo
            来挡。两者要配合使用，缺一不可。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 原因4：state 位置不对（状态提升过高）============
// 结论：state 放在哪，哪里就重渲染。能放低就放低。

// 反例：count 提到父级，导致兄弟组件 HeavySibling 跟着渲染
function HeavySibling() {
  const renders = useRenderCount()
  const flash = useFlashStyle()
  // 模拟渲染耗时
  const end = performance.now() + 3
  while (performance.now() < end) {
    /* 故意阻塞 */
  }

  return (
    <div
      style={{
        ...flash,
        padding: '6px 10px',
        borderRadius: 6,
        border: '1px dashed #d9d9d9'
      }}
    >
      <Space size="small">
        <Text style={{ fontSize: 12 }}>耗时兄弟组件（~3ms）</Text>
        <RenderBadge count={renders} />
      </Space>
    </div>
  )
}

// 正例：把 counter 封装成独立组件，state 不再泄露到父级
function SelfContainedCounter() {
  const [count, setCount] = useState(0)
  return (
    <Button size="small" onClick={() => setCount((c) => c + 1)}>
      内聚计数器 +1（当前: {count}）
    </Button>
  )
}

const Reason4StateLocation: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <Card
      title="原因4：state 位置过高"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 10 }}>
        state 放在父组件 → 父渲染 → 所有子组件受牵连。
        <Text strong>能放低就放低</Text>
        ——把 state 和用它的 UI 封装在同一个组件里。
      </Paragraph>

      <Row gutter={[12, 0]}>
        <Col xs={24} md={12}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            ❌ state 在父级
          </Text>
          <div style={{ marginTop: 6 }}>
            <Button
              size="small"
              style={{ marginBottom: 8 }}
              onClick={() => setCount((c) => c + 1)}
            >
              父 state +1（当前: {count}）
            </Button>
            <HeavySibling />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            ✅ state 内聚在子组件
          </Text>
          <div style={{ marginTop: 6 }}>
            <SelfContainedCounter />
            <div style={{ marginTop: 8 }}>
              <HeavySibling />
            </div>
          </div>
        </Col>
      </Row>

      <Alert
        style={{ marginTop: 10 }}
        type="success"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>原则：</Text>state
            只影响用它的组件。放得越低，受牵连的组件越少，不需要 memo
            也能避免无效渲染。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 页面 ============

const RenderDemo: React.FC = () => (
  <div>
    <Title level={3}>渲染可视化：为什么重渲染 / 如何止损</Title>
    <Paragraph>
      React 组件重渲染有且只有
      <Text strong> 4 个根本原因</Text>
      ，理解每一个，就能精准止损，不靠猜。
    </Paragraph>
    <Paragraph type="secondary" style={{ fontSize: 12 }}>
      提示：背景色每次渲染随机变化，颜色闪烁即表示发生了渲染。StrictMode
      下次数翻倍属正常。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Reason1State />
      </Col>
      <Col xs={24} lg={12}>
        <Reason2Props />
      </Col>
      <Col xs={24} lg={12}>
        <Reason3Context />
      </Col>
      <Col xs={24} lg={12}>
        <Reason4StateLocation />
      </Col>
    </Row>
  </div>
)

export default RenderDemo
