import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react'

const { Title, Text, Paragraph } = Typography

// ============ 场景1: useRef 访问 DOM ============
const DomRefDemo: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [log, setLog] = useState<string[]>([])

  const focus = () => { inputRef.current?.focus(); setLog((l) => [...l, 'focus()']) }
  const blur = () => { inputRef.current?.blur(); setLog((l) => [...l, 'blur()']) }
  const select = () => { inputRef.current?.select(); setLog((l) => [...l, 'select()']) }

  return (
    <Card title="useRef 操作 DOM" size="small" style={{ borderRadius: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <input ref={inputRef} defaultValue="通过 ref 直接操作 DOM 元素"
          style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 6, padding: '4px 11px' }} />
        <Space>
          <Button size="small" onClick={focus}>focus()</Button>
          <Button size="small" onClick={blur}>blur()</Button>
          <Button size="small" onClick={select}>select()</Button>
        </Space>
        <Text type="secondary">操作记录: {log.join(' → ') || '(无)'}</Text>
      </Space>
    </Card>
  )
}

// ============ 场景2: forwardRef + useImperativeHandle ============
interface ChildHandle {
  reset: () => void
  getValue: () => string
  setFocus: () => void
}

const ForwardChild = forwardRef<ChildHandle, { label: string }>((props, ref) => {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    reset: () => setValue(''),
    getValue: () => value,
    setFocus: () => inputRef.current?.focus(),
  }))

  return (
    <Card size="small" title={props.label} style={{ border: '2px dashed #1677ff', borderRadius: 8 }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="子组件内部输入框"
        style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 6, padding: '4px 11px' }}
      />
    </Card>
  )
})
ForwardChild.displayName = 'ForwardChild'

const ForwardRefDemo: React.FC = () => {
  const childRef = useRef<ChildHandle>(null)
  const [parentMsg, setParentMsg] = useState('')

  return (
    <Card title="forwardRef + useImperativeHandle" size="small" style={{ borderRadius: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <ForwardChild ref={childRef} label="子组件 (forwardRef)" />

        <Space wrap>
          <Button size="small" type="primary" onClick={() => childRef.current?.setFocus()}>
            调用 setFocus()
          </Button>
          <Button size="small" onClick={() => {
            const v = childRef.current?.getValue() ?? ''
            setParentMsg(v)
          }}>
            调用 getValue()
          </Button>
          <Button size="small" danger onClick={() => { childRef.current?.reset(); setParentMsg('') }}>
            调用 reset()
          </Button>
        </Space>

        {parentMsg && (
          <Alert message={<>父组件读取到子组件的值: <Text strong>{parentMsg}</Text></>} type="success" showIcon />
        )}
      </Space>
    </Card>
  )
}

// ============ 场景3: useRef 保存非渲染数据 ============
const TimerDemo: React.FC = () => {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    if (running) return
    setRunning(true)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRunning(false)
  }

  const reset = () => { stop(); setSeconds(0) }

  return (
    <Card title="useRef 保存 timer（不触发渲染）" size="small" style={{ borderRadius: 8 }}>
      <Space direction="vertical">
        <Text style={{ fontSize: 32, fontWeight: 700 }}>{seconds}s</Text>
        <Space>
          <Button type="primary" onClick={start} disabled={running}>开始</Button>
          <Button onClick={stop} disabled={!running}>暂停</Button>
          <Button danger onClick={reset}>重置</Button>
        </Space>
        <Text type="secondary">timerRef.current 存储定时器 ID，修改它不会触发重渲染</Text>
      </Space>
    </Card>
  )
}

// ============ 页面 ============
const RefDemo: React.FC = () => (
  <div>
    <Title level={3}>Ref 命令式通信</Title>
    <Paragraph>
      <Tag color="pink">useRef</Tag>
      <Tag color="pink">forwardRef</Tag>
      <Tag color="pink">useImperativeHandle</Tag>
      三种典型使用场景。
    </Paragraph>

    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}><DomRefDemo /></Col>
      <Col xs={24} md={8}><ForwardRefDemo /></Col>
      <Col xs={24} md={8}><TimerDemo /></Col>
    </Row>
  </div>
)

export default RefDemo
