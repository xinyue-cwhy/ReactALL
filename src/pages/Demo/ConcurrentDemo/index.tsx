const { Title, Text, Paragraph } = Typography

// ============ 模拟耗时渲染的慢组件 ============

// 故意让 JS 同步阻塞 ms 毫秒，模拟复杂渲染
function slowRender(ms: number) {
  const end = performance.now() + ms
  while (performance.now() < end) {
    /* 故意阻塞 */
  }
}

// 生成 N 条搜索结果（每条渲染时都会阻塞）
function SearchResults({ query }: { query: string }) {
  if (!query) return <Text type="secondary">输入关键词开始搜索</Text>

  // 模拟渲染 500 条结果，每条耗时 0.1ms，总计约 50ms
  const results = Array.from(
    { length: 500 },
    (_, i) => `${query} 相关结果 #${i + 1}`
  )

  return (
    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
      {results.map((r) => {
        slowRender(0.1) // 每条渲染耗时
        return (
          <div
            key={r}
            style={{
              padding: '2px 0',
              fontSize: 12,
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            {r}
          </div>
        )
      })}
    </div>
  )
}

// ============ 场景1：无优化 vs useTransition ============

const TransitionDemo: React.FC = () => {
  // 无优化：输入框和搜索结果都是紧急更新
  const [query1, setQuery1] = useState('')

  // useTransition：把搜索结果标记为非紧急
  const [query2, setQuery2] = useState('')
  const [pending, startTransition] = useTransition()
  const [transitQuery, setTransitQuery] = useState('')

  return (
    <Card
      title="useTransition — 标记非紧急更新"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        两个搜索框都渲染 500 条结果（故意做慢），感受输入流畅度的差异
      </Paragraph>

      <Row gutter={[16, 0]}>
        {/* 左：无优化 */}
        <Col xs={24} md={12}>
          <Text strong>无优化</Text>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            输入时卡顿，渲染阻塞输入框
          </Text>
          <Input
            style={{ margin: '8px 0' }}
            placeholder="输入感受卡顿..."
            value={query1}
            onChange={(e) => setQuery1(e.target.value)}
          />
          <SearchResults query={query1} />
        </Col>

        {/* 右：useTransition */}
        <Col xs={24} md={12}>
          <Space>
            <Text strong>useTransition</Text>
            {pending && <Tag color="orange">结果更新中...</Tag>}
          </Space>
          <Text
            type="secondary"
            style={{ fontSize: 12, marginLeft: 8, display: 'block' }}
          >
            输入流畅，结果延迟渲染
          </Text>
          <Input
            style={{ margin: '8px 0' }}
            placeholder="输入感受流畅..."
            value={query2}
            onChange={(e) => {
              setQuery2(e.target.value) // 紧急：立即更新输入框
              startTransition(() => {
                setTransitQuery(e.target.value) // 非紧急：可被打断，让输入框先更新
              })
            }}
          />
          <SearchResults query={transitQuery} />
        </Col>
      </Row>

      <Alert
        style={{ marginTop: 12 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>原理：</Text>
            startTransition 里的更新优先级降低，React
            会先处理紧急更新（输入框），
            再处理非紧急更新（搜索结果）。如果紧急更新来了，非紧急更新会被中断重来。
            <Text strong style={{ marginLeft: 4 }}>
              pending
            </Text>{' '}
            为 true 表示非紧急更新还在进行中。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景2：useDeferredValue ============

// 和 useTransition 效果类似，区别在于：
// useTransition 包裹的是"setState 调用"
// useDeferredValue 包裹的是"值"，适合无法控制 setState 的场景（比如 props 传进来的值）

const DeferredDemo: React.FC = () => {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query) // 滞后的值，优先级低

  const isStale = query !== deferredQuery // true 表示结果还没跟上输入

  return (
    <Card
      title="useDeferredValue — 滞后值"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        用一个值控制输入框，用它的滞后版本渲染列表，效果和 useTransition 相同
      </Paragraph>

      <Input
        placeholder="输入关键词..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 8 }}
      />

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          实时值：<Text code>{query || '(空)'}</Text>
          {'  '}滞后值：
          <Text code style={{ color: isStale ? '#fa8c16' : '#52c41a' }}>
            {deferredQuery || '(空)'}
          </Text>
          {isStale && (
            <Tag color="orange" style={{ marginLeft: 8 }}>
              结果滞后中
            </Tag>
          )}
        </Text>
      </div>

      <div style={{ opacity: isStale ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        <SearchResults query={deferredQuery} />
      </div>

      <Alert
        style={{ marginTop: 12 }}
        type="success"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>与 useTransition 的区别：</Text>
            useTransition 包裹 setState 调用（需要控制更新的地方），
            useDeferredValue 包裹值（适合 props 传入、无法控制 setState
            的场景）。 两者都能让 UI 保持响应，选哪个取决于你能不能访问到
            setState。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景3：useTransition 的 pending 状态 ============

// 模拟一个"切换 Tab 内容很慢"的场景
const tabs = ['首页', '文章', '关于']

function SlowTabContent({ tab }: { tab: string }) {
  slowRender(80) // 模拟该 Tab 内容渲染耗时 80ms
  return (
    <div
      style={{
        padding: 16,
        background: '#f5f5f5',
        borderRadius: 6,
        minHeight: 80
      }}
    >
      <Text>「{tab}」的内容（渲染耗时 ~80ms）</Text>
    </div>
  )
}

const TabDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('首页')
  const [pendingTab, setPendingTab] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleTabClick = (tab: string) => {
    setPendingTab(tab) // 立即标记哪个 tab 在 pending
    startTransition(() => {
      setActiveTab(tab) // 非紧急：等当前渲染完再切
    })
  }

  return (
    <Card
      title="useTransition + pending — Tab 切换"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        切换 Tab 时内容渲染较慢，用 pending 在旧内容上显示加载状态，而不是白屏
      </Paragraph>

      <Space style={{ marginBottom: 12 }}>
        {tabs.map((tab) => (
          <Button
            key={tab}
            type={activeTab === tab ? 'primary' : 'default'}
            size="small"
            loading={isPending && pendingTab === tab}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </Button>
        ))}
      </Space>

      <div
        style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}
      >
        <SlowTabContent tab={activeTab} />
      </div>

      <Alert
        style={{ marginTop: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>关键点：</Text>
            isPending 为 true 时旧内容还在显示（变暗），新内容准备好后才切换。
            对比不用 useTransition：点击后直接白屏等待，体验更差。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 页面 ============
const ConcurrentDemo: React.FC = () => (
  <div>
    <Title level={3}>并发渲染：useTransition / useDeferredValue</Title>
    <Paragraph>
      React 18 并发模式让更新有了<Text strong>优先级</Text>：
      <Tag color="red" style={{ margin: '0 4px' }}>
        紧急更新
      </Tag>
      （输入、点击）优先渲染，
      <Tag color="orange" style={{ margin: '0 4px' }}>
        非紧急更新
      </Tag>
      （大列表、慢组件）可被打断延后， 保持 UI 始终响应。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <TransitionDemo />
      </Col>
      <Col xs={24} lg={12}>
        <DeferredDemo />
      </Col>
      <Col xs={24} lg={12}>
        <TabDemo />
      </Col>
    </Row>
  </div>
)

export default ConcurrentDemo
