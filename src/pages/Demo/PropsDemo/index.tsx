import React, { useState } from 'react'
import { Card, Button, Input, Typography, Space, Divider, Alert, Tag, Row, Col } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

// ============ 子组件 ============
interface ChildProps {
  message: string          // 父 -> 子: props
  count: number
  onCountChange: (n: number) => void  // 子 -> 父: 回调
  onSendMessage: (msg: string) => void
}

const ChildComponent: React.FC<ChildProps> = ({ message, count, onCountChange, onSendMessage }) => {
  const [input, setInput] = useState('')

  return (
    <Card
      title={<><ArrowDownOutlined style={{ color: '#1677ff' }} /> 子组件 (ChildComponent)</>}
      style={{ border: '2px solid #1677ff', borderRadius: 8 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert message={<>父组件传来的消息: <Text strong>{message}</Text></>} type="info" showIcon />
        <Alert message={<>父组件传来的 count: <Text strong>{count}</Text></>} type="success" showIcon />

        <Divider dashed>子 → 父：通过回调函数</Divider>

        <Space>
          <Button onClick={() => onCountChange(count - 1)}>count - 1</Button>
          <Button type="primary" onClick={() => onCountChange(count + 1)}>count + 1</Button>
        </Space>

        <Input
          placeholder="子组件输入内容发送给父组件"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={() => { onSendMessage(input); setInput('') }}
          addonAfter={
            <Button type="link" size="small" onClick={() => { onSendMessage(input); setInput('') }}>
              发送
            </Button>
          }
        />
      </Space>
    </Card>
  )
}

// ============ 孙子组件 ============
interface GrandchildProps {
  value: string
}

const GrandchildComponent: React.FC<GrandchildProps> = ({ value }) => (
  <Card
    title="孙子组件 (GrandchildComponent)"
    size="small"
    style={{ border: '2px dashed #52c41a', borderRadius: 8 }}
  >
    <Text>接收到的 value: <Tag color="green">{value || '(空)'}</Tag></Text>
  </Card>
)

// ============ 父组件（页面） ============
const PropsDemo: React.FC = () => {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('你好，子组件！')
  const [fromChild, setFromChild] = useState('')

  return (
    <div>
      <Title level={3}>Props 父子通信</Title>
      <Paragraph>
        <Tag color="blue">父 → 子</Tag> 通过 <Text code>props</Text> 传递数据 &nbsp;
        <Tag color="green">子 → 父</Tag> 通过<Text code>回调函数</Text>通知父组件
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          {/* 父组件 */}
          <Card
            title={<><ArrowUpOutlined style={{ color: '#52c41a' }} /> 父组件 (ParentComponent)</>}
            style={{ border: '2px solid #52c41a', borderRadius: 8 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text>发送给子组件的消息:</Text>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: 240 }}
                />
              </Space>
              <Alert
                message={<>从子组件收到: <Text strong>{fromChild || '(等待子组件发送...)'}</Text></>}
                type="warning"
                showIcon
              />

              {/* 子组件 */}
              <ChildComponent
                message={message}
                count={count}
                onCountChange={setCount}
                onSendMessage={setFromChild}
              />

              {/* 孙子组件：props 逐层传递 */}
              <GrandchildComponent value={message} />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PropsDemo
