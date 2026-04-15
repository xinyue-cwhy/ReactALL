import { useVirtualizer } from '@tanstack/react-virtual'

const { Title, Text, Paragraph } = Typography

const TOTAL = 10_000
const ITEM_HEIGHT = 52
const LIST_HEIGHT = 420
const TAG_COLORS = ['blue', 'green', 'purple', 'orange', 'cyan']
const TAGS = ['前端', '后端', '全栈', '算法', 'UI/UX']

// 在模块顶层生成，避免每次渲染重建
const ITEMS = Array.from({ length: TOTAL }, (_, i) => ({
  id: i,
  name: `用户 ${String(i + 1).padStart(5, '0')}`,
  score: (i * 7 + 13) % 100,
  tag: TAGS[i % 5]
}))

// ============ 列表行（两个列表复用）============

function ListRow({
  id,
  name,
  score,
  tag,
  style
}: (typeof ITEMS)[0] & { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        borderBottom: '1px solid #f5f5f5',
        gap: 12,
        background: '#fff',
        height: ITEM_HEIGHT,
        boxSizing: 'border-box',
        ...style
      }}
    >
      <Text type="secondary" style={{ width: 64, fontSize: 11, flexShrink: 0 }}>
        #{id + 1}
      </Text>
      <Text style={{ flex: 1, fontSize: 13 }}>{name}</Text>
      <Tag color={TAG_COLORS[id % 5]} style={{ flexShrink: 0 }}>
        {tag}
      </Tag>
      <Text
        code
        style={{ fontSize: 11, flexShrink: 0, width: 42, textAlign: 'right' }}
      >
        {score} 分
      </Text>
    </div>
  )
}

// ============ 场景1：普通列表 ============

const NormalList: React.FC = () => {
  const [rendered, setRendered] = useState(false)
  const [renderTime, setRenderTime] = useState(0)
  const startRef = useRef(0)

  const handleRender = () => {
    startRef.current = performance.now()
    setRendered(true)
  }

  useEffect(() => {
    if (rendered) {
      setRenderTime(Math.round(performance.now() - startRef.current))
    }
  }, [rendered])

  return (
    <Card
      title="普通列表（全量渲染）"
      size="small"
      style={{ borderRadius: 8 }}
      extra={
        rendered ? (
          <Space size="small">
            <Tag color="red">DOM 节点：~{(TOTAL * 4).toLocaleString()} 个</Tag>
            <Tag color="orange">耗时：{renderTime} ms</Tag>
          </Space>
        ) : null
      }
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        把 {TOTAL.toLocaleString()} 条数据全部写入
        DOM，渲染一次即产生数万个节点。
        滚动时浏览器需要管理所有节点的布局，帧率明显下降。
      </Paragraph>

      {!rendered ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Space direction="vertical" size={12}>
            <Text type="secondary">
              点击后浏览器将创建 {TOTAL.toLocaleString()} 个列表行
            </Text>
            <Button type="primary" danger onClick={handleRender}>
              渲染全量列表（可能短暂卡顿）
            </Button>
          </Space>
        </div>
      ) : (
        <div
          style={{
            height: LIST_HEIGHT,
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: 6
          }}
        >
          {ITEMS.map((item) => (
            <ListRow key={item.id} {...item} />
          ))}
        </div>
      )}
    </Card>
  )
}

// ============ 场景2：虚拟列表 ============

const VirtualList: React.FC = () => {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: TOTAL,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <Card
      title="虚拟列表（按需渲染）"
      size="small"
      style={{ borderRadius: 8 }}
      extra={
        <Space size="small">
          <Tag color="green">DOM 中：{virtualItems.length} 条</Tag>
          <Tag color="blue">总数：{TOTAL.toLocaleString()} 条</Tag>
        </Space>
      }
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        只渲染可见区域内的行（约 {Math.ceil(LIST_HEIGHT / ITEM_HEIGHT) + 5} 条 +
        overscan），滚动时动态替换内容，DOM 节点数始终保持在极少量。
      </Paragraph>

      <div
        ref={parentRef}
        style={{
          height: LIST_HEIGHT,
          overflowY: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: 6
        }}
      >
        {/* 撑开总滚动高度，让滚动条位置正确 */}
        <div
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualItems.map((vi) => (
            <ListRow
              key={vi.key}
              {...ITEMS[vi.index]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${vi.start}px)`
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

// ============ 场景3：原理说明 ============

const PrincipleSection: React.FC = () => (
  <Card title="核心原理" size="small" style={{ borderRadius: 8 }}>
    <Row gutter={[12, 12]}>
      <Col xs={24} md={12}>
        <div
          style={{
            padding: '12px 14px',
            background: '#f6ffed',
            borderRadius: 6,
            border: '1px solid #b7eb8f'
          }}
        >
          <Text
            strong
            style={{ fontSize: 13, display: 'block', marginBottom: 10 }}
          >
            虚拟列表做了什么
          </Text>
          <Space direction="vertical" size={6}>
            {[
              '① 用一个大容器撑开「总高度」→ 滚动条位置正确',
              '② 监听 scroll 事件，计算当前可见的索引范围',
              '③ 只渲染可见范围内的行（+ overscan 缓冲）',
              '④ 每行用 position:absolute + translateY 精准定位',
              '⑤ 滚动时更新索引范围，复用已有 DOM 节点'
            ].map((s, i) => (
              <Text key={i} type="secondary" style={{ fontSize: 12 }}>
                {s}
              </Text>
            ))}
          </Space>
        </div>
      </Col>
      <Col xs={24} md={12}>
        <div
          style={{
            padding: '12px 14px',
            background: '#fff7e6',
            borderRadius: 6,
            border: '1px solid #ffd591'
          }}
        >
          <Text
            strong
            style={{ fontSize: 13, display: 'block', marginBottom: 10 }}
          >
            useVirtualizer 关键参数
          </Text>
          <Space direction="vertical" size={6}>
            {[
              ['count', '总数据条数'],
              ['getScrollElement', '返回可滚动容器的 ref'],
              ['estimateSize', '每行的预估高度（px）'],
              ['overscan', '可见区域外额外渲染的条数'],
              ['getTotalSize()', '列表总像素高度（撑开容器用）'],
              ['getVirtualItems()', '当前需要渲染的条目数组']
            ].map(([key, desc]) => (
              <div key={key} style={{ fontSize: 12, display: 'flex', gap: 8 }}>
                <Text code style={{ fontSize: 11, flexShrink: 0 }}>
                  {key}
                </Text>
                <Text type="secondary">{desc}</Text>
              </div>
            ))}
          </Space>
        </div>
      </Col>
    </Row>

    <Alert
      style={{ marginTop: 12 }}
      type="info"
      showIcon
      message={
        <Text style={{ fontSize: 12 }}>
          <Text strong>适用场景：</Text>列表项数 &gt; 500
          时考虑虚拟化；表格、瀑布流、聊天记录、日志流均适用。
          行高固定时性能最优；行高不固定可用 <Text code>measureElement</Text>{' '}
          动态测量。
        </Text>
      }
    />
  </Card>
)

// ============ 页面 ============

const VirtualDemo: React.FC = () => (
  <div>
    <Title level={3}>虚拟列表：处理万级数据</Title>
    <Paragraph>
      普通列表把所有数据写入 DOM，数据量大时渲染慢、滚动卡。 虚拟列表只渲染
      <Text strong>可见区域</Text>
      内的行，无论总数多少，DOM 节点数始终保持在很少量。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <NormalList />
      </Col>
      <Col xs={24}>
        <VirtualList />
      </Col>
      <Col xs={24}>
        <PrincipleSection />
      </Col>
    </Row>
  </div>
)

export default VirtualDemo
