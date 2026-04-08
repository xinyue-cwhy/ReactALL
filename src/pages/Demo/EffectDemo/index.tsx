import { useEffect, useRef, useState } from 'react'

const { Title, Text, Paragraph } = Typography

// ============ 场景1：依赖数组的三种写法 ============
const DepsDemo: React.FC = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('Alice')
  const [logs, setLogs] = useState<string[]>([])
  // 在组件体内递增，等价于无依赖 effect 的执行次数（且不触发重渲染）
  const renderCount = useRef(0)
  renderCount.current++

  const addLog = (msg: string) => setLogs((l) => [...l.slice(-4), msg])

  // 无依赖数组：每次渲染后都执行
  // ⚠️ 不能在这里调用 setState（addLog 也不行）
  // 否则：effect → setState → 重渲染 → effect → setState → ... 无限循环！
  useEffect(() => {
    console.log(`[无依赖] 第 ${renderCount.current} 次渲染后执行`)
  })

  // 空依赖数组：只在挂载时执行一次
  useEffect(() => {
    addLog('[空依赖] 挂载时执行（仅一次）')
  }, [])

  // 有依赖：只在 count 变化时执行
  useEffect(() => {
    addLog(`[依赖 count] count 变为 ${count}`)
  }, [count])

  return (
    <Card title="依赖数组的三种写法" size="small" style={{ borderRadius: 8 }}>
      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        改变下面两个值，观察哪个 useEffect 被触发
      </Paragraph>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={() => setCount((c) => c + 1)}>
          count + 1（当前 {count}）
        </Button>
        <Button
          onClick={() => setName((n) => (n === 'Alice' ? 'Bob' : 'Alice'))}
        >
          切换 name（当前 {name}）
        </Button>
      </Space>
      <Tag color="purple" style={{ marginBottom: 8 }}>
        [无依赖] 已执行 {renderCount.current} 次（每次渲染后，控制台可见）
      </Tag>
      <Card
        size="small"
        style={{ background: '#f6f8fa', borderRadius: 6 }}
        styles={{ body: { padding: '8px 12px' } }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          effect 日志（最近 5 条）：
        </Text>
        {logs.map((l, i) => (
          <div key={i} style={{ fontSize: 12, fontFamily: 'monospace' }}>
            {l}
          </div>
        ))}
      </Card>
      <Alert
        style={{ marginTop: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>[无依赖] effect 不能调用 setState</Text>
            {' ，否则触发无限循环。切换 name 时只有它执行，可在控制台观察。'}
          </Text>
        }
      />
      <Alert
        style={{ marginTop: 8 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text code>无依赖数组</Text> → 每次渲染后执行 &nbsp;|&nbsp;
            <Text code>[]</Text> → 只挂载时执行 &nbsp;|&nbsp;
            <Text code>[count]</Text> → count 变化时执行
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景2：清理函数 ============
const CleanupDemo: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [mountLog, setMountLog] = useState<string[]>([])

  const addLog = (msg: string) => setMountLog((l) => [...l.slice(-4), msg])

  return (
    <Card
      title="清理函数（return 里做清理）"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        挂载时监听 mousemove，卸载时移除，避免内存泄漏
      </Paragraph>
      <Space style={{ marginBottom: 12 }}>
        <Button
          type={visible ? 'default' : 'primary'}
          danger={visible}
          onClick={() => {
            setVisible((v) => {
              addLog(
                v ? '卸载：移除 mousemove 监听' : '挂载：注册 mousemove 监听'
              )
              return !v
            })
          }}
        >
          {visible ? '卸载子组件' : '挂载子组件'}
        </Button>
      </Space>

      {visible && <MouseTracker onMove={(x, y) => setPos({ x, y })} />}

      {visible && (
        <Tag color="blue" style={{ marginTop: 8 }}>
          鼠标位置：x={pos.x} y={pos.y}
        </Tag>
      )}

      <Card
        size="small"
        style={{ background: '#f6f8fa', borderRadius: 6, marginTop: 8 }}
        styles={{ body: { padding: '8px 12px' } }}
      >
        {mountLog.map((l, i) => (
          <div key={i} style={{ fontSize: 12, fontFamily: 'monospace' }}>
            {l}
          </div>
        ))}
      </Card>
      <Alert
        style={{ marginTop: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            不清理的后果：组件卸载后监听器仍存在，持续占用内存，甚至引发
            setState 报错
          </Text>
        }
      />
    </Card>
  )
}

// 子组件：挂载时注册监听，卸载时清理
const MouseTracker: React.FC<{ onMove: (x: number, y: number) => void }> = ({
  onMove
}) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    window.addEventListener('mousemove', handler)

    // ★ 清理函数：组件卸载时执行，移除监听
    return () => {
      window.removeEventListener('mousemove', handler)
    }
  }, [onMove])

  return <Tag color="green">MouseTracker 已挂载，移动鼠标试试</Tag>
}

// ============ 场景3：闭包陷阱 ============
const StaleClosure: React.FC = () => {
  const [count, setCount] = useState(0)
  const countRef = useRef(count)
  // 每次渲染同步 ref，让回调里始终能拿到最新值
  countRef.current = count

  // ❌ 闭包陷阱：3 秒后打印的永远是旧值 0
  const alertStale = () => {
    setTimeout(() => {
      alert(`[闭包陷阱] 3 秒前的 count：${count}`)
    }, 3000)
  }

  // ✅ 用 ref 解决：3 秒后读 ref，拿到最新值
  const alertFresh = () => {
    setTimeout(() => {
      alert(`[ref 解决] 当前最新 count：${countRef.current}`)
    }, 3000)
  }

  return (
    <Card title="闭包陷阱 & 解决方案" size="small" style={{ borderRadius: 8 }}>
      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        点击按钮后，3 秒内多次点击 count + 1，观察弹出值的区别
      </Paragraph>
      <Space style={{ marginBottom: 12 }} wrap>
        <Button type="primary" onClick={() => setCount((c) => c + 1)}>
          count + 1（当前 {count}）
        </Button>
        <Button danger onClick={alertStale}>
          3s 后 alert（有陷阱）
        </Button>
        <Button type="primary" ghost onClick={alertFresh}>
          3s 后 alert（用 ref）
        </Button>
      </Space>
      <Alert
        type="error"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>闭包陷阱本质：</Text>
            {
              ' useEffect / setTimeout 回调在创建时捕获了当时的 count，之后 count 更新，但回调里的引用不变。解决：用 '
            }
            <Text code>useRef</Text>
            {' 存最新值，或用函数式更新 '}
            <Text code>setCount(c =&gt; c + 1)</Text>
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景4：数据获取 + 竞态处理 ============
const FetchDemo: React.FC = () => {
  const [userId, setUserId] = useState(1)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setUser(null)

    // ★ 竞态处理：用 cancelled flag 避免旧请求覆盖新结果
    let cancelled = false

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setUser(data)
          setLoading(false)
        }
      })

    return () => {
      // 切换 userId 时，取消旧请求的 setState
      cancelled = true
    }
  }, [userId])

  return (
    <Card title="数据获取 + 竞态处理" size="small" style={{ borderRadius: 8 }}>
      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        快速切换用户，旧请求的结果不会覆盖新结果
      </Paragraph>
      <Space style={{ marginBottom: 12 }}>
        {[1, 2, 3, 4].map((id) => (
          <Button
            key={id}
            type={userId === id ? 'primary' : 'default'}
            size="small"
            onClick={() => setUserId(id)}
          >
            用户 {id}
          </Button>
        ))}
      </Space>
      {loading ? (
        <Spin size="small" />
      ) : user ? (
        <Card size="small" style={{ background: '#f6f8fa', borderRadius: 6 }}>
          <Text strong>{user.name}</Text>
          <br />
          <Text type="secondary">{user.email}</Text>
        </Card>
      ) : null}
      <Alert
        style={{ marginTop: 12 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>竞态问题：</Text>
            快速切换时，慢请求可能比快请求后返回，导致旧数据覆盖新数据。 用{' '}
            <Text code>cancelled</Text> flag 或{' '}
            <Text code>AbortController</Text> 处理。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 页面 ============
const EffectDemo: React.FC = () => (
  <div>
    <Title level={3}>useEffect 副作用</Title>
    <Paragraph>
      <Tag color="cyan">useEffect</Tag> 在渲染后执行副作用（数据请求、订阅、操作
      DOM）。掌握依赖数组、清理函数、闭包陷阱是用好它的关键。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <DepsDemo />
      </Col>
      <Col xs={24} md={12}>
        <CleanupDemo />
      </Col>
      <Col xs={24} md={12}>
        <StaleClosure />
      </Col>
      <Col xs={24} md={12}>
        <FetchDemo />
      </Col>
    </Row>
  </div>
)

export default EffectDemo
