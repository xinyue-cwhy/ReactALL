const { Title, Text, Paragraph } = Typography

// ============ 懒加载组件（必须定义在模块顶层，不能放在组件内部）============
// 用 setTimeout 模拟 1.5s 网络延迟，让加载状态可见
// 实际项目中延迟来自浏览器下载 chunk 文件的网络耗时
const HeavyPanel = lazy(
  () =>
    new Promise<{ default: React.ComponentType }>((resolve) =>
      setTimeout(() => import('./HeavyPanel').then(resolve), 1500)
    )
)

// ============ 自定义加载占位符 ============

const PanelSkeleton: React.FC = () => (
  <Card size="small" style={{ borderRadius: 8 }}>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Skeleton.Input active style={{ width: 200 }} />
      <Skeleton active paragraph={{ rows: 2 }} />
      <Space>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton.Button key={i} active size="small" />
        ))}
      </Space>
    </Space>
  </Card>
)

// ============ 场景1：本项目路由级懒加载 ============

const routerSnippet = `// src/router/index.tsx

// ① React.lazy + 动态 import()
//    Vite 会把每个 import() 打成独立 chunk 文件
const Home     = lazy(() => import('../pages/Home'))
const MemoDemo = lazy(() => import('../pages/Demo/MemoDemo'))
const LazyDemo = lazy(() => import('../pages/Demo/LazyDemo'))
// ...其余路由同理

// ② 封装 withSuspense：统一 Loading 占位
const withSuspense = (Component: FC) => (
  <Suspense fallback={<Spin size="large" />}>
    <Component />
  </Suspense>
)

// ③ 在路由表中使用
const router = createBrowserRouter([{
  path: '/',
  element: <AppLayout />,
  children: [
    { index: true,        element: withSuspense(Home) },
    { path: 'demo/memo', element: withSuspense(MemoDemo) },
    { path: 'demo/lazy', element: withSuspense(LazyDemo) },
  ]
}])`

const RouterLazySection: React.FC = () => (
  <Card
    title="路由级代码分割（本项目实现）"
    size="small"
    style={{ borderRadius: 8 }}
  >
    <Paragraph type="secondary" style={{ marginBottom: 12 }}>
      本项目所有路由页面都通过 <Text code>React.lazy</Text> 懒加载。
      切换路由时浏览器才下载对应页面的 JS chunk，首屏只加载必要代码。
    </Paragraph>

    <pre
      style={{
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '16px',
        borderRadius: 8,
        fontSize: 12,
        overflowX: 'auto',
        lineHeight: 1.65,
        margin: 0
      }}
    >
      <code>{routerSnippet}</code>
    </pre>

    <Alert
      style={{ marginTop: 12 }}
      type="info"
      showIcon
      message={
        <Text style={{ fontSize: 12 }}>
          <Text strong>验证方式：</Text>打开 DevTools → Network → 筛选 JS →
          切换到不同路由，可以看到每次加载一个新的 chunk 文件（如{' '}
          <Text code>LazyDemo-xxxxx.js</Text>
          ）。已访问过的路由不会重复加载。
        </Text>
      }
    />
  </Card>
)

// ============ 场景2：组件级懒加载演示 ============

const ComponentLazySection: React.FC = () => {
  const [show, setShow] = useState(false)
  const [everShown, setEverShown] = useState(false)

  const handleToggle = () => {
    if (!everShown) setEverShown(true)
    setShow((s) => !s)
  }

  return (
    <Card
      title="组件级懒加载（交互演示）"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        点击按钮触发 <Text code>HeavyPanel</Text> 的首次加载（模拟 1.5s 延迟）。
        加载完成后，隐藏再显示将直接从内存读取，没有等待。
      </Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={handleToggle}
          icon={show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        >
          {show
            ? '隐藏 HeavyPanel'
            : !everShown
              ? '首次加载 HeavyPanel（模拟 1.5s 延迟）'
              : '显示 HeavyPanel（已缓存，瞬间）'}
        </Button>
        {everShown && <Tag color="green">chunk 已缓存</Tag>}
      </Space>

      {show && (
        <Suspense fallback={<PanelSkeleton />}>
          <HeavyPanel />
        </Suspense>
      )}

      <Alert
        style={{ marginTop: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>关键限制：</Text>
            <Text code>React.lazy</Text> 必须在<Text strong>模块顶层</Text>
            定义，不能写在组件函数内部。否则每次渲染都会创建新的 lazy 引用，导致
            Suspense 反复重置为加载状态。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景3：原理 & 最佳实践 ============

const PrincipleSection: React.FC = () => (
  <Card title="原理 & 最佳实践" size="small" style={{ borderRadius: 8 }}>
    <Row gutter={[12, 12]}>
      <Col xs={24} md={12}>
        <div
          style={{
            padding: '12px 14px',
            background: '#f6ffed',
            borderRadius: 6,
            border: '1px solid #b7eb8f',
            height: '100%'
          }}
        >
          <Text
            strong
            style={{ fontSize: 13, display: 'block', marginBottom: 8 }}
          >
            懒加载的工作流程
          </Text>
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {[
              '① 构建时：Vite 把 import() 打成独立 .js chunk',
              '② 运行时：组件首次渲染 → Suspense 捕获 Promise',
              '③ 显示 fallback（Skeleton / Spin 占位）',
              '④ chunk 下载完成 → Promise resolve → 渲染组件',
              '⑤ 后续显示：chunk 已缓存，无需重新下载'
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
            border: '1px solid #ffd591',
            height: '100%'
          }}
        >
          <Text
            strong
            style={{ fontSize: 13, display: 'block', marginBottom: 8 }}
          >
            最佳实践
          </Text>
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {[
              '✅ 路由页面一律懒加载（收益最大）',
              '✅ 按需加载大型依赖（图表、编辑器等）',
              '✅ fallback 用 Skeleton 而非简单 Spin',
              '✅ 配合 ErrorBoundary 处理加载失败',
              '⚠️ 小组件不值得拆分（请求本身有开销）'
            ].map((s, i) => (
              <Text key={i} type="secondary" style={{ fontSize: 12 }}>
                {s}
              </Text>
            ))}
          </Space>
        </div>
      </Col>
    </Row>
  </Card>
)

// ============ 页面 ============

const LazyDemo: React.FC = () => (
  <div>
    <Title level={3}>代码分割：lazy + Suspense</Title>
    <Paragraph>
      <Text code>React.lazy</Text> + 动态 <Text code>import()</Text>{' '}
      让每个路由/组件成为独立 JS chunk，按需加载减少首屏体积。
      <Text code>Suspense</Text> 负责在 chunk 下载期间显示占位内容。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <RouterLazySection />
      </Col>
      <Col xs={24}>
        <ComponentLazySection />
      </Col>
      <Col xs={24}>
        <PrincipleSection />
      </Col>
    </Row>
  </div>
)

export default LazyDemo
