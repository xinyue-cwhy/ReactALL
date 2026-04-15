import { useState } from 'react'
import ChildComponent from './ChildComponent'
import GrandchildComponent from './GrandchildComponent'

const { Title, Text, Paragraph } = Typography

// ── 阶段七：useActionState 教学 Section ──────────────────────────────────────

type FormResult =
  | { status: 'idle' }
  | { status: 'success'; username: string; email: string }
  | { status: 'error'; message: string }

// 模拟注册接口（1 秒延迟，邮箱含 "fail" 时报错）
function registerUser(_username: string, email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email.includes('fail')) {
        reject(new Error('该邮箱已被注册'))
      } else {
        resolve()
      }
    }, 1000)
  })
}

const ActionStateSection = () => {
  // useActionState 签名：
  //   const [state, action, isPending] = useActionState(actionFn, initialState)
  //
  // - actionFn(prevState, formData)：可以是 async 函数
  // - isPending：action 执行期间自动为 true，无需额外 useState
  // - action：可直接传给 <form action={action}> 或 <button formAction={action}>
  const [result, submitAction, isPending] = useActionState(
    async (_prev: FormResult, formData: FormData): Promise<FormResult> => {
      const username = (formData.get('username') as string).trim()
      const email = (formData.get('email') as string).trim()

      // 前端校验
      if (username.length < 3) {
        return { status: 'error', message: '用户名至少 3 个字符' }
      }
      if (!email.includes('@')) {
        return { status: 'error', message: '邮箱格式不正确' }
      }

      // 调用异步接口
      try {
        await registerUser(username, email)
        return { status: 'success', username, email }
      } catch (e) {
        return { status: 'error', message: (e as Error).message }
      }
    },
    { status: 'idle' }
  )

  return (
    <Card
      title={
        <Space>
          <Tag color="volcano">React 19</Tag>
          场景：useActionState 表单 Action
        </Space>
      }
      style={{ borderRadius: 8 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message={
            <span>
              <Text code>useActionState</Text> 是 React 19 内置的表单状态管理 Hook。
              将 <Text code>action</Text> 直接绑定到 <Text code>{'<form>'}</Text>，
              自动处理 pending 状态，无需手写 isLoading。
            </span>
          }
          type="info"
          showIcon
        />

        {/* 注册表单 */}
        <form action={submitAction}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>用户名（至少 3 个字符）</Text>
              <Input
                name="username"
                placeholder="请输入用户名"
                disabled={isPending}
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                邮箱（含 "fail" 触发服务端错误）
              </Text>
              <Input
                name="email"
                placeholder="请输入邮箱"
                disabled={isPending}
                style={{ marginTop: 4 }}
              />
            </div>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              icon={<UserOutlined />}
            >
              {isPending ? '注册中…' : '注册'}
            </Button>
          </Space>
        </form>

        {/* 结果展示 */}
        {result.status === 'success' && (
          <Alert
            message={`注册成功！用户名：${result.username}，邮箱：${result.email}`}
            type="success"
            showIcon
          />
        )}
        {result.status === 'error' && (
          <Alert message={result.message} type="error" showIcon />
        )}

        {/* 原理对比 */}
        <Alert
          message={
            <div>
              <Text strong>对比传统 useState 方式：</Text>
              <table style={{ width: '100%', marginTop: 6, fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '4px 8px', border: '1px solid #e8e8e8', textAlign: 'left' }}>对比点</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #e8e8e8', textAlign: 'left' }}>useState + 手写</th>
                    <th style={{ padding: '4px 8px', border: '1px solid #e8e8e8', textAlign: 'left' }}>useActionState</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['pending 状态', '需手写 setIsLoading', 'isPending 自动提供'],
                    ['表单绑定', 'onSubmit + preventDefault', 'action={action} 原生表单'],
                    ['表单重置', '手动清空各字段 state', '提交后自动重置'],
                    ['Server Actions', '不支持', '天然兼容（Next.js 场景）'],
                  ].map(([label, old, newW]) => (
                    <tr key={label}>
                      <td style={{ padding: '4px 8px', border: '1px solid #e8e8e8' }}>{label}</td>
                      <td style={{ padding: '4px 8px', border: '1px solid #e8e8e8', color: '#ff4d4f' }}>{old}</td>
                      <td style={{ padding: '4px 8px', border: '1px solid #e8e8e8', color: '#52c41a' }}>{newW}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          type="warning"
          showIcon={false}
        />
      </Space>
    </Card>
  )
}

// ── Props 父子通信 Section ────────────────────────────────────────────────────

const PropsDemo: React.FC = () => {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('你好，子组件！')
  const [fromChild, setFromChild] = useState('')

  return (
    <div>
      <Title level={3}>Props 父子通信</Title>
      <Paragraph>
        <Tag color="blue">父 → 子</Tag> 通过 <Text code>props</Text> 传递数据
        &nbsp;
        <Tag color="green">子 → 父</Tag> 通过<Text code>回调函数</Text>
        通知父组件
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {/* 阶段七：useActionState */}
        <ActionStateSection />

        <Divider>阶段一：Props 父子通信</Divider>
      </Space>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <>
                <ArrowUpOutlined style={{ color: '#52c41a' }} /> 父组件
                (ParentComponent)
              </>
            }
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
                message={
                  <>
                    从子组件收到:{' '}
                    <Text strong>{fromChild || '(等待子组件发送...)'}</Text>
                  </>
                }
                type="warning"
                showIcon
              />

              {/* 子组件 */}
              <ChildComponent
                message={message}
                count={count}
                renderCount={() => (
                  <>
                    <Text>当前 count是 </Text>
                    <Text strong>{count}</Text>
                  </>
                )}
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
