import { Component, type ErrorInfo, type ReactNode } from 'react'

const { Title, Text, Paragraph } = Typography

// ── ErrorBoundary 类组件 ────────────────────────────────────────────────────
// React 只支持类组件作为 Error Boundary（函数组件暂不支持）
// 必须实现以下两个静态/实例方法之一：
//   - static getDerivedStateFromError：渲染阶段，决定显示什么
//   - componentDidCatch：提交阶段，适合上报日志

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // 渲染阶段调用：子组件抛出错误时触发
  // 返回值会合并到 state，用于决定渲染什么
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  // 提交阶段调用：适合上报错误日志（Sentry 等）
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] 捕获到错误:', error)
    console.error('[ErrorBoundary] 组件栈:', info.componentStack)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      if (fallback) return fallback(error, this.reset)
      return (
        <Result
          status="error"
          title="组件崩溃"
          subTitle={error.message}
          extra={
            <Button type="primary" onClick={this.reset}>
              重试
            </Button>
          }
        />
      )
    }

    return children
  }
}

// ── 故意崩溃的组件 ──────────────────────────────────────────────────────────

const BuggyCounter = ({ shouldCrash }: { shouldCrash: boolean }) => {
  if (shouldCrash) {
    // 渲染时抛出错误 → 被最近的 ErrorBoundary 捕获
    throw new Error('BuggyCounter: 渲染时发生致命错误！')
  }
  return (
    <Alert message="组件正常运行中" type="success" showIcon />
  )
}

const UncaughtDemo = () => {
  // 没有 ErrorBoundary 包裹：错误会冒泡到根，整个应用崩溃
  throw new Error('未捕获的错误：整个页面白屏')
}

// ── 演示区 ──────────────────────────────────────────────────────────────────

export const ErrorBoundarySection = () => {
  const [crash1, setCrash1] = useState(false)
  const [crash2, setCrash2] = useState(false)
  const [showUncaught, setShowUncaught] = useState(false)

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      {/* 场景一：默认 fallback */}
      <Card title="场景一：默认 fallback（Result 页）" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="ErrorBoundary 用 getDerivedStateFromError 捕获子组件错误，渲染 fallback 而不是白屏"
            type="info"
            showIcon
          />
          <ErrorBoundary>
            <BuggyCounter shouldCrash={crash1} />
          </ErrorBoundary>
          <Button
            danger={!crash1}
            onClick={() => setCrash1((v) => !v)}
          >
            {crash1 ? '（已崩溃，点 ErrorBoundary 里的"重试"恢复）' : '触发崩溃'}
          </Button>
        </Space>
      </Card>

      {/* 场景二：自定义 fallback */}
      <Card title="场景二：自定义 fallback（带错误详情）" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <ErrorBoundary
            fallback={(error, reset) => (
              <Alert
                message={`捕获到错误: ${error.message}`}
                description="这是自定义的 fallback UI，可以展示更多上下文信息"
                type="error"
                showIcon
                action={
                  <Button size="small" onClick={reset}>
                    重置
                  </Button>
                }
              />
            )}
          >
            <BuggyCounter shouldCrash={crash2} />
          </ErrorBoundary>
          <Button danger={!crash2} onClick={() => setCrash2((v) => !v)}>
            {crash2 ? '（已崩溃，点上方"重置"恢复）' : '触发崩溃'}
          </Button>
        </Space>
      </Card>

      {/* 场景三：没有 ErrorBoundary */}
      <Card title="场景三：没有 ErrorBoundary → 整个应用崩溃" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="生产环境中，未被捕获的渲染错误会导致整个 React 树卸载（白屏）"
            type="warning"
            showIcon
          />
          {showUncaught && <UncaughtDemo />}
          <Button
            danger
            onClick={() => setShowUncaught(true)}
            disabled={showUncaught}
          >
            触发未捕获错误（页面会崩溃，刷新恢复）
          </Button>
        </Space>
      </Card>

      {/* 原理说明 */}
      <Card title="getDerivedStateFromError vs componentDidCatch" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message={
              <div>
                <div style={{ marginBottom: 4 }}>
                  <Text code>getDerivedStateFromError(error)</Text>
                  <Text> — 渲染阶段，纯函数，返回新 state，决定显示 fallback</Text>
                </div>
                <div>
                  <Text code>componentDidCatch(error, info)</Text>
                  <Text> — 提交阶段，有副作用，适合上报日志（Sentry.captureException）</Text>
                </div>
              </div>
            }
            type="info"
            showIcon={false}
          />
          <Alert
            message={
              <div>
                <Text strong>ErrorBoundary 捕获不到：</Text>
                <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                  <li>事件处理函数中的错误（用 try/catch）</li>
                  <li>异步代码（setTimeout、Promise）</li>
                  <li>ErrorBoundary 自身的错误</li>
                </ul>
              </div>
            }
            type="warning"
            showIcon={false}
          />
        </Space>
      </Card>
    </Space>
  )
}
