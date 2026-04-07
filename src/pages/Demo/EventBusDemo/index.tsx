import React, { useEffect, useState } from 'react'
import emitter from '../../../utils/eventBus'

const { Title, Text, Paragraph } = Typography

// ============ 发布者组件 A ============
const PublisherA: React.FC = () => {
  const [msg, setMsg] = useState('')

  const send = () => {
    if (!msg.trim()) return
    emitter.emit('message', msg)
    setMsg('')
  }

  const notify = (type: 'success' | 'error' | 'info') => {
    emitter.emit('notify', { type, content: `来自组件A的${type}通知` })
  }

  return (
    <Card
      title={<><SendOutlined /> 发布者 A</>}
      style={{ border: '2px solid #1677ff', borderRadius: 8 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="输入消息发布给所有订阅者"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onPressEnter={send}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={send}>发布</Button>
        </Space.Compact>

        <Divider>发布通知事件</Divider>
        <Space wrap>
          <Button size="small" type="primary" ghost onClick={() => notify('success')}>
            发布 success
          </Button>
          <Button size="small" danger ghost onClick={() => notify('error')}>
            发布 error
          </Button>
          <Button size="small" onClick={() => notify('info')}>
            发布 info
          </Button>
        </Space>
      </Space>
    </Card>
  )
}

const Divider: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ borderTop: '1px dashed #d9d9d9', margin: '8px 0', textAlign: 'center', position: 'relative' }}>
    <span style={{ background: '#fff', padding: '0 8px', color: '#999', fontSize: 12, position: 'relative', top: -10 }}>
      {children}
    </span>
  </div>
)

// ============ 订阅者组件 B ============
const SubscriberB: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const handler = (msg: string) => {
      setMessages((prev) => [...prev, msg])
      setUnread((n) => n + 1)
    }
    emitter.on('message', handler)
    return () => emitter.off('message', handler)  // 组件卸载时取消订阅
  }, [])

  return (
    <Card
      title={
        <Badge count={unread} size="small">
          <BellOutlined /> 订阅者 B（message 事件）
        </Badge>
      }
      style={{ border: '2px solid #52c41a', borderRadius: 8 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button size="small" onClick={() => setUnread(0)}>标为已读</Button>
        <List
          size="small"
          dataSource={messages}
          renderItem={(item, i) => (
            <List.Item><Tag color="blue">#{i + 1}</Tag> {item}</List.Item>
          )}
          locale={{ emptyText: '等待接收消息...' }}
          style={{ maxHeight: 200, overflowY: 'auto' }}
        />
      </Space>
    </Card>
  )
}

// ============ 订阅者组件 C ============
const SubscriberC: React.FC = () => {
  const [notifications, setNotifications] = useState<Array<{ type: string; content: string }>>([])

  useEffect(() => {
    const handler = (data: { type: 'success' | 'error' | 'info'; content: string }) => {
      setNotifications((prev) => [...prev, data])
    }
    emitter.on('notify', handler)
    return () => emitter.off('notify', handler)
  }, [])

  return (
    <Card
      title={<><NotificationOutlined /> 订阅者 C（notify 事件）</>}
      style={{ border: '2px solid #fa8c16', borderRadius: 8 }}
    >
      <List
        size="small"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item>
            <Alert message={item.content} type={item.type as 'success' | 'error' | 'info'} showIcon style={{ width: '100%', padding: '2px 8px' }} />
          </List.Item>
        )}
        locale={{ emptyText: '等待接收通知...' }}
        style={{ maxHeight: 200, overflowY: 'auto' }}
      />
    </Card>
  )
}

// ============ 页面 ============
const EventBusDemo: React.FC = () => (
  <div>
    <Title level={3}>EventBus 发布订阅</Title>
    <Paragraph>
      基于 <Text code>mitt</Text> 实现事件总线，兄弟组件间解耦通信，无需公共父组件传递。
      <Tag color="cyan" style={{ marginLeft: 8 }}>emit</Tag>
      <Tag color="cyan">on</Tag>
      <Tag color="cyan">off</Tag>
    </Paragraph>

    <Alert
      message="发布者 A 和订阅者 B/C 没有父子关系，通过 EventBus 实现任意组件通信"
      type="info" showIcon style={{ marginBottom: 16 }}
    />

    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}><PublisherA /></Col>
      <Col xs={24} md={8}><SubscriberB /></Col>
      <Col xs={24} md={8}><SubscriberC /></Col>
    </Row>
  </div>
)

export default EventBusDemo
