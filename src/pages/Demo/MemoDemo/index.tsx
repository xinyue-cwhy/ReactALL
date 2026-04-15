const { Title, Text, Paragraph } = Typography

// ============ 工具：渲染次数追踪 ============

// 注：开发模式（StrictMode）下 React 会双重调用渲染函数，次数是生产环境的 2 倍，属正常现象。
// 重要的是对比两者的【相对差异】：不优化的次数持续增长，优化后的保持不变。

function useRenderCount(): number {
  const count = useRef(0)
  count.current++
  return count.current
}

function RenderTag({ count, warn = false }: { count: number; warn?: boolean }) {
  const color = count <= 2 ? 'green' : warn ? 'red' : 'orange'
  return <Tag color={color}>渲染 {count} 次</Tag>
}

// ============ 场景1：React.memo 基础 ============

// 普通子组件：无论 props 是否变化，父渲染时它必然渲染
function NormalChild({ name }: { name: string }) {
  const renders = useRenderCount()
  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#fff1f0',
        borderRadius: 6,
        border: '1px solid #ffa39e'
      }}
    >
      <Space>
        <Text style={{ fontSize: 12 }}>普通子组件</Text>
        <Text code style={{ fontSize: 11 }}>
          name=&quot;{name}&quot;
        </Text>
        <RenderTag count={renders} warn />
      </Space>
    </div>
  )
}

// memo 子组件：React 在渲染前浅比较 props，未变化则跳过
const MemoChild = memo(function MemoChild({ name }: { name: string }) {
  const renders = useRenderCount()
  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#f6ffed',
        borderRadius: 6,
        border: '1px solid #b7eb8f'
      }}
    >
      <Space>
        <Text style={{ fontSize: 12 }}>memo 子组件</Text>
        <Text code style={{ fontSize: 11 }}>
          name=&quot;{name}&quot;
        </Text>
        <RenderTag count={renders} />
      </Space>
    </div>
  )
})

const MemoBasicDemo: React.FC = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('Alice')

  return (
    <Card
      title="React.memo — 跳过无关渲染"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        父组件有两个状态：计数器 和 name。子组件只接收 name。 点「计数器 +1」时
        name 未变，看哪个子组件会跟着重渲染。
      </Paragraph>

      <Space style={{ marginBottom: 12 }}>
        <Button onClick={() => setCount((c) => c + 1)}>
          计数器 +1（当前: {count}）
        </Button>
        <Button
          onClick={() => setName((n) => (n === 'Alice' ? 'Bob' : 'Alice'))}
        >
          切换 name（当前: {name}）
        </Button>
      </Space>

      <Space direction="vertical" style={{ width: '100%' }}>
        <NormalChild name={name} />
        <MemoChild name={name} />
      </Space>

      <Alert
        style={{ marginTop: 12 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>结论：</Text>
            memo 对 props 做浅比较，name 未变时跳过渲染。切换 name
            时两者都会渲染。
            <Text strong> 浅比较</Text>
            意味着对象/数组每次新建会被认为"变化了"——这正是 useCallback /
            useMemo 存在的原因。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景2：useCallback 保持回调引用稳定 ============

const ButtonChild = memo(function ButtonChild({
  label,
  onClick,
  isGood
}: {
  label: string
  onClick: () => void
  isGood: boolean
}) {
  const renders = useRenderCount()
  return (
    <div
      style={{
        padding: '8px 12px',
        background: isGood ? '#f6ffed' : '#fff1f0',
        borderRadius: 6,
        border: `1px solid ${isGood ? '#b7eb8f' : '#ffa39e'}`
      }}
    >
      <Space>
        <Text style={{ fontSize: 12 }}>{label}</Text>
        <RenderTag count={renders} warn={!isGood} />
        <Button size="small" onClick={onClick}>
          点我
        </Button>
      </Space>
    </div>
  )
})

const CallbackDemo: React.FC = () => {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState<string[]>([])

  // 每次渲染都创建新函数引用 → memo 浅比较失败 → 子组件重渲染
  const handlerWithout = () =>
    setLog((prev) => [...prev, `无 useCallback，父计数 ${count}`])

  // useCallback 让引用保持稳定（依赖 count 变化才更新）→ memo 生效
  const handlerWith = useCallback(
    () => setLog((prev) => [...prev, `有 useCallback，父计数 ${count}`]),
    [count]
  )

  return (
    <Card
      title="useCallback — 保持回调引用稳定"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        两个子组件都用 memo 包裹，区别在于传入的回调是否用 useCallback。
        点「父计数器 +1」，观察哪个子组件因回调引用变化而重渲染。
      </Paragraph>

      <Button
        style={{ marginBottom: 12 }}
        onClick={() => setCount((c) => c + 1)}
      >
        父计数器 +1（当前: {count}）
      </Button>

      <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }}>
        <ButtonChild
          label="无 useCallback（memo 失效）"
          onClick={handlerWithout}
          isGood={false}
        />
        <ButtonChild
          label="有 useCallback（memo 生效）"
          onClick={handlerWith}
          isGood={true}
        />
      </Space>

      {log.length > 0 && (
        <div
          style={{
            maxHeight: 72,
            overflowY: 'auto',
            fontSize: 11,
            color: '#888',
            background: '#fafafa',
            padding: '4px 8px',
            borderRadius: 4,
            marginBottom: 12
          }}
        >
          {log.slice(-5).map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}

      <Alert
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>原因：</Text>
            函数在每次渲染时都会重新创建，引用地址不同。memo
            做浅比较时，新旧函数引用不同 → 认为 props 变了 → 触发渲染。
            useCallback 把函数"钉住"，只在依赖变化时才更新引用。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景3：useMemo 缓存昂贵计算 ============

// 模拟耗时 ~5ms 的过滤操作
function slowFilter(list: number[], threshold: number): number[] {
  const end = performance.now() + 5
  while (performance.now() < end) {
    /* 故意阻塞 */
  }
  return list.filter((n) => n >= threshold).sort((a, b) => b - a)
}

// 定义在组件外，引用稳定，不会成为 useMemo 的无效依赖
const NUMBERS = Array.from({ length: 200 }, (_, i) => i % 100)

const UseMemoDemo: React.FC = () => {
  const [threshold, setThreshold] = useState(50)
  const [darkMode, setDarkMode] = useState(false) // 与过滤逻辑无关的状态

  const renders = useRenderCount()

  // 无 useMemo：每次渲染都重算，包括 darkMode 切换时
  const calcCountRef = useRef(0)
  calcCountRef.current++ // 随渲染次数增长
  const filteredWithout = slowFilter(NUMBERS, threshold)

  // 有 useMemo：只在 threshold 变化时重算
  const memoCalcCountRef = useRef(0)
  const filteredWith = useMemo(() => {
    memoCalcCountRef.current++
    return slowFilter(NUMBERS, threshold)
  }, [threshold])

  return (
    <Card
      title="useMemo — 缓存昂贵计算"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        对 200 个数字做过滤（故意耗时 ~5ms）。
        切换「暗色模式」是与过滤无关的状态，观察两者计算次数的差异。
      </Paragraph>

      <Space style={{ marginBottom: 12 }} wrap>
        <Button onClick={() => setThreshold((t) => Math.max(0, t - 10))}>
          阈值 −10
        </Button>
        <Tag>阈值: {threshold}</Tag>
        <Button onClick={() => setThreshold((t) => Math.min(90, t + 10))}>
          阈值 +10
        </Button>
        <Button
          type={darkMode ? 'primary' : 'default'}
          onClick={() => setDarkMode((d) => !d)}
        >
          切换暗色（无关状态）
        </Button>
      </Space>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <div
            style={{
              padding: '10px 14px',
              background: '#fff1f0',
              borderRadius: 6,
              border: '1px solid #ffa39e'
            }}
          >
            <Text strong style={{ fontSize: 12 }}>
              无 useMemo
            </Text>
            <div style={{ marginTop: 6 }}>
              <Space size="small" wrap>
                <Tag>组件渲染: {renders} 次</Tag>
                <Tag color="red">计算次数: {calcCountRef.current}</Tag>
                <Tag>结果: {filteredWithout.length} 项</Tag>
              </Space>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div
            style={{
              padding: '10px 14px',
              background: '#f6ffed',
              borderRadius: 6,
              border: '1px solid #b7eb8f'
            }}
          >
            <Text strong style={{ fontSize: 12 }}>
              有 useMemo
            </Text>
            <div style={{ marginTop: 6 }}>
              <Space size="small" wrap>
                <Tag>组件渲染: {renders} 次</Tag>
                <Tag color="green">计算次数: {memoCalcCountRef.current}</Tag>
                <Tag>结果: {filteredWith.length} 项</Tag>
              </Space>
            </div>
          </div>
        </Col>
      </Row>

      <Alert
        style={{ marginTop: 12 }}
        type="success"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>结论：</Text>切换暗色时组件重渲染， 无 useMemo
            的计算次数随之增加；有 useMemo 的计算次数只在 threshold
            变化时增加，组件渲染次数相同。
            <br />
            <Text strong>注意：</Text>
            useMemo 有维护缓存的成本，只对真正耗时的计算才值得用，别滥用。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 页面 ============

const MemoDemo: React.FC = () => (
  <div>
    <Title level={3}>性能优化：React.memo / useMemo / useCallback</Title>
    <Paragraph>
      React 默认行为：父组件渲染时，所有子组件
      <Text strong>无条件重渲染</Text>
      。三个工具帮你精确控制渲染时机，避免无效开销。
    </Paragraph>
    <Paragraph type="secondary" style={{ fontSize: 12 }}>
      提示：开发模式（StrictMode）下渲染次数是生产环境的 2 倍，属正常现象。
      关注两者之间的<Text strong>相对差异</Text>即可。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <MemoBasicDemo />
      </Col>
      <Col xs={24}>
        <CallbackDemo />
      </Col>
      <Col xs={24}>
        <UseMemoDemo />
      </Col>
    </Row>
  </div>
)

export default MemoDemo
