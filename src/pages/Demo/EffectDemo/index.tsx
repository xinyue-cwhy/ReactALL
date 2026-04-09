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
  // ⚠️ 开发环境 StrictMode 会执行两次：挂载 → 模拟卸载 → 重新挂载，目的是暴露没写 cleanup 的 bug；生产环境只执行一次
  useEffect(() => {
    console.log(`[无依赖] 第 ${renderCount.current} 次渲染后执行`)
  })

  // 空依赖数组：只在挂载时执行一次（生产环境），开发环境 StrictMode 执行两次
  useEffect(() => {
    addLog('[空依赖] 挂载时执行（仅一次）')
  }, [])

  // 有依赖：只在 count 变化时执行，开发环境初始挂载同样执行两次
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

  // ❌ 闭包陷阱：3 秒后打印的永远是旧值
  //    每次渲染都会创建新的 alertStale，但 setTimeout 注册的是点击时那一刻的旧函数
  //    那个函数的 count 快照永远是点击时的值，不会更新
  const alertStale = () => {
    setTimeout(() => {
      alert(`[闭包陷阱] 3 秒前的 count：${count}`)
    }, 3000)
  }

  // ✅ 方案一：用 ref 解决——ref 是贯穿整个生命周期的同一个对象
  //    countRef.current 每次渲染都被更新，3 秒后读到的是最新值
  const alertFresh = () => {
    setTimeout(() => {
      alert(`[ref 解决] 当前最新 count：${countRef.current}`)
    }, 3000)
  }

  // ✅ 方案二：函数式更新——适用于"更新 state"的场景（不是读取）
  //    setCount(c => c + 1) 中的 c 由 React 传入，永远是最新值
  //    所以即使在空依赖的 effect 里也不会有闭包陷阱：
  //
  //    useEffect(() => {
  //      const timer = setInterval(() => {
  //        setCount(c => c + 1)  // ✅ c 是 React 保证的最新值
  //        // setCount(count + 1) ❌ count 是快照，永远是 effect 创建时的值
  //      }, 1000)
  //      return () => clearInterval(timer)
  //    }, [])
  //
  //    注意：函数式更新只能解决"写"，alert(count) 这种"读"只能用 ref

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

// ============ 场景3b：函数式更新 vs 闭包陷阱（setInterval）============
const IntervalDemo: React.FC = () => {
  const [staleCount, setStaleCount] = useState(0)
  const [freshCount, setFreshCount] = useState(0)
  const [running, setRunning] = useState(false)

  // ❌ 闭包陷阱版：空依赖，staleCount 快照永远是 0
  //    setInterval 回调捕获了 effect 创建时的 staleCount = 0
  //    每次执行 0 + 1 = 1，staleCount 永远是 1
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setStaleCount(staleCount + 1)
    }, 500)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]) // 故意不加 staleCount，模拟陷阱：让 staleCount 永远是快照 0

  // ✅ 函数式更新版：c 由 React 传入，永远是最新值，空依赖也没问题
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setFreshCount((c) => c + 1)
    }, 500)
    return () => clearInterval(timer)
  }, [running])

  const handleToggle = () => {
    if (running) {
      setRunning(false)
    } else {
      setStaleCount(0)
      setFreshCount(0)
      setRunning(true)
    }
  }

  return (
    <Card
      title="函数式更新 vs 闭包陷阱（setInterval）"
      size="small"
      style={{ borderRadius: 8 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        同样的 setInterval，每 500ms +1，观察两个计数器的区别
      </Paragraph>
      <Button
        type={running ? 'default' : 'primary'}
        danger={running}
        onClick={handleToggle}
        style={{ marginBottom: 16 }}
      >
        {running ? '停止' : '开始计时'}
      </Button>
      <Row gutter={16}>
        <Col span={12}>
          <Card
            size="small"
            style={{
              background: '#fff1f0',
              borderRadius: 6,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 12, color: '#ff4d4f', marginBottom: 4 }}>
              ❌ setCount(count + 1)
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#ff4d4f' }}>
              {staleCount}
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              count 快照永远是 0，结果永远是 1
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            size="small"
            style={{
              background: '#f6ffed',
              borderRadius: 6,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 4 }}>
              ✅ setCount(c =&gt; c + 1)
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#52c41a' }}>
              {freshCount}
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              c 由 React 传入，永远是最新值
            </div>
          </Card>
        </Col>
      </Row>
      <Alert
        style={{ marginTop: 12 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>函数式更新的局限：</Text>
            只能解决"写"（更新 state）的闭包陷阱。 如果需要"读"最新值（如
            alert、上报），还是要用 <Text code>useRef</Text>。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 场景4：数据获取 + 竞态处理 ============

// 方案一：cancelled flag（请求继续跑，但结果被忽略）
const FetchWithFlag: React.FC<{
  userId: number
  label: string
}> = ({ userId, label }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setUser(null)

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
      cancelled = true // 旧请求回来后不 setState，但网络请求还在跑
    }
  }, [userId])

  return loading ? (
    <Spin size="small" />
  ) : user ? (
    <Card size="small" style={{ background: '#f6f8fa', borderRadius: 6 }}>
      <Tag color="blue" style={{ marginBottom: 4 }}>
        {label}
      </Tag>
      <div>
        <Text strong>{user.name}</Text>
      </div>
      <Text type="secondary">{user.email}</Text>
    </Card>
  ) : null
}

// 方案二：AbortController（真正取消网络请求，浏览器不再等待响应）
const FetchWithAbort: React.FC<{
  userId: number
  label: string
}> = ({ userId, label }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setUser(null)

    // ★ 创建一个控制器，每次 effect 执行都是新的
    const controller = new AbortController()

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
      signal: controller.signal // 把信号传给 fetch
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch((err) => {
        // abort() 会让 fetch 抛出 AbortError，需要捕获，否则控制台报错
        if (err.name !== 'AbortError') throw err
      })

    return () => {
      controller.abort() // cleanup：真正取消网络请求，浏览器停止等待响应
    }
  }, [userId])

  return loading ? (
    <Spin size="small" />
  ) : user ? (
    <Card size="small" style={{ background: '#f6f8fa', borderRadius: 6 }}>
      <Tag color="green" style={{ marginBottom: 4 }}>
        {label}
      </Tag>
      <div>
        <Text strong>{user.name}</Text>
      </div>
      <Text type="secondary">{user.email}</Text>
    </Card>
  ) : null
}

const FetchDemo: React.FC = () => {
  const [userId, setUserId] = useState(1)

  return (
    <Card title="数据获取 + 竞态处理" size="small" style={{ borderRadius: 8 }}>
      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        快速切换用户，对比两种竞态处理方式的区别
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
      <Row gutter={[12, 0]}>
        <Col span={12}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
            cancelled flag（请求仍在跑，只忽略结果）
          </div>
          <FetchWithFlag userId={userId} label="cancelled flag" />
        </Col>
        <Col span={12}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
            AbortController（真正取消网络请求）
          </div>
          <FetchWithAbort userId={userId} label="AbortController" />
        </Col>
      </Row>
      <Alert
        style={{ marginTop: 12 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>区别：</Text>
            <Text code>cancelled flag</Text>
            {' 请求发出去就收不回来，浏览器还在等响应，浪费带宽。'}
            <Text code>AbortController</Text>
            {' 调用 abort() 后浏览器立即终止请求，节省资源，是更彻底的方案。'}
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
        <IntervalDemo />
      </Col>
      <Col xs={24} md={12}>
        <FetchDemo />
      </Col>
    </Row>
  </div>
)

export default EffectDemo
