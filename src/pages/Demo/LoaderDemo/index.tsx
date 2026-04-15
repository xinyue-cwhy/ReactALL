import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation
} from 'react-router-dom'
import type { Note } from './loaderAction'

const { Title, Text, Paragraph } = Typography

// ============ 笔记列表 ============

const NoteList: React.FC<{ notes: Note[] }> = ({ notes }) => {
  const navigation = useNavigation()
  // 任意 Form 提交中时 state === 'submitting'
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Card
      title={
        <Space>
          <Text strong>笔记列表</Text>
          <Tag color="blue">来自 useLoaderData()</Tag>
          {isSubmitting && <Spin size="small" />}
        </Space>
      }
      size="small"
      style={{ borderRadius: 8 }}
    >
      {notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary">暂无笔记</Text>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size={4}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: note.done ? '#f6ffed' : '#fafafa',
                borderRadius: 6,
                border: `1px solid ${note.done ? '#b7eb8f' : '#f0f0f0'}`
              }}
            >
              {/* 勾选 Toggle */}
              <Form method="post" style={{ display: 'contents' }}>
                <input type="hidden" name="intent" value="toggle" />
                <input type="hidden" name="id" value={note.id} />
                <button
                  type="submit"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `2px solid ${note.done ? '#52c41a' : '#d9d9d9'}`,
                    background: note.done ? '#52c41a' : '#fff',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  disabled={isSubmitting}
                >
                  {note.done && (
                    <span
                      style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              </Form>

              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  textDecoration: note.done ? 'line-through' : 'none',
                  color: note.done ? '#8c8c8c' : '#262626'
                }}
              >
                {note.content}
              </Text>

              {/* 删除 */}
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={note.id} />
                <button
                  type="submit"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#ff4d4f',
                    fontSize: 13,
                    padding: '0 4px'
                  }}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </Form>
            </div>
          ))}
        </Space>
      )}
    </Card>
  )
}

// ============ 添加表单 ============

const AddNoteForm: React.FC = () => {
  const actionData = useActionData() as { error?: string } | undefined
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Card
      title={
        <Space>
          <Text strong>添加笔记</Text>
          <Tag color="orange">Form + action + useActionData()</Tag>
        </Space>
      }
      size="small"
      style={{ borderRadius: 8 }}
    >
      {/* react-router-dom 的 <Form> 会拦截提交，调用路由 action */}
      <Form method="post">
        <input type="hidden" name="intent" value="add" />
        <Space.Compact style={{ width: '100%' }}>
          <input
            name="content"
            placeholder="输入笔记内容..."
            style={{
              flex: 1,
              padding: '6px 12px',
              border: `1px solid ${actionData?.error ? '#ff4d4f' : '#d9d9d9'}`,
              borderRadius: '6px 0 0 6px',
              outline: 'none',
              fontSize: 13
            }}
          />
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            style={{ borderRadius: '0 6px 6px 0' }}
          >
            添加
          </Button>
        </Space.Compact>
        {actionData?.error && (
          <Text
            type="danger"
            style={{ fontSize: 12, marginTop: 4, display: 'block' }}
          >
            {actionData.error}
          </Text>
        )}
      </Form>

      <Alert
        style={{ marginTop: 10 }}
        type="info"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text code>{'<Form method="post">'}</Text> 提交时调用路由 action；
            action 返回 <Text code>redirect()</Text> 后 loader
            重新运行，列表自动刷新； action 返回普通对象时{' '}
            <Text code>useActionData()</Text> 可读取（如校验错误）。
          </Text>
        }
      />
    </Card>
  )
}

// ============ 原理说明 ============

const PrincipleCard: React.FC = () => (
  <Card title="loader / action 数据流" size="small" style={{ borderRadius: 8 }}>
    <pre
      style={{
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '14px 16px',
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.65,
        overflowX: 'auto',
        margin: 0
      }}
    >
      <code>{`// router/index.tsx
{
  path: 'demo/loader',
  element: withSuspense(LoaderDemo),
  loader: loaderFn,   // 导航时自动运行，resolve 后再渲染组件
  action: actionFn,   // <Form method="post"> 提交时运行
}

// 组件里
const { notes } = useLoaderData()        // 读 loader 返回值
const actionData = useActionData()       // 读 action 返回值（非 redirect 时）
const navigation = useNavigation()       // navigation.state: idle/loading/submitting

// action 函数
export async function action({ request }) {
  const formData = await request.formData()
  // 处理写操作...
  return redirect('/demo/loader')  // 触发 loader 重新获取，列表自动刷新
  // 或 return { error: '...' }    // 返回给 useActionData()
}`}</code>
    </pre>

    <Row gutter={[10, 10]} style={{ marginTop: 12 }}>
      <Col xs={24} md={12}>
        <div
          style={{
            padding: '10px 12px',
            background: '#f0f5ff',
            borderRadius: 6,
            border: '1px solid #adc6ff'
          }}
        >
          <Text
            strong
            style={{ fontSize: 12, display: 'block', marginBottom: 6 }}
          >
            loader vs useEffect 数据加载
          </Text>
          <Space direction="vertical" size={3}>
            {[
              '✅ loader：导航时并行运行，组件渲染时数据已就绪',
              '✅ loader：无 loading 状态管理，无竞态问题',
              '⚠️ useEffect：组件先渲染再请求，有 loading/error 状态',
              '⚠️ useEffect：需手动处理竞态、清理、依赖'
            ].map((s, i) => (
              <Text key={i} type="secondary" style={{ fontSize: 11 }}>
                {s}
              </Text>
            ))}
          </Space>
        </div>
      </Col>
      <Col xs={24} md={12}>
        <div
          style={{
            padding: '10px 12px',
            background: '#fff7e6',
            borderRadius: 6,
            border: '1px solid #ffd591'
          }}
        >
          <Text
            strong
            style={{ fontSize: 12, display: 'block', marginBottom: 6 }}
          >
            action vs onSubmit 提交处理
          </Text>
          <Space direction="vertical" size={3}>
            {[
              '✅ action：原生 Form 语义，支持 JS 未加载时降级',
              '✅ action：提交后自动重新运行 loader，无需手动刷新',
              '✅ action：navigation.state 追踪提交状态',
              '⚠️ onSubmit：需手动 setState + 重新 fetch'
            ].map((s, i) => (
              <Text key={i} type="secondary" style={{ fontSize: 11 }}>
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

const LoaderDemo: React.FC = () => {
  const { notes } = useLoaderData() as { notes: Note[] }

  return (
    <div>
      <Title level={3}>loader / action 数据路由模式</Title>
      <Paragraph>
        React Router v7 的数据路由让<Text strong>数据加载</Text>和
        <Text strong>写操作</Text>
        与路由绑定。loader 在渲染前获取数据，action 处理表单提交，
        组件只负责展示，不需要管理 loading / error 状态。
      </Paragraph>

      <Alert
        style={{ marginBottom: 16 }}
        type="warning"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>观察：</Text>
            切换到本页时有 300ms 延迟（loader 模拟 API 请求）， 页面
            <Text strong>渲染时数据已就绪</Text>
            ，不会出现先渲染空列表再填充的闪烁。 勾选 / 删除 /
            添加后列表自动刷新（action → redirect → loader）。
          </Text>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <NoteList notes={notes} />
        </Col>
        <Col xs={24} md={10}>
          <AddNoteForm />
        </Col>
        <Col xs={24}>
          <PrincipleCard />
        </Col>
      </Row>
    </div>
  )
}

export default LoaderDemo
