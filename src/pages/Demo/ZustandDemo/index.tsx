import { memo, useRef } from 'react'
import { useCartStore, useSelectorStore } from './store'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography

// ============ 精确订阅 Demo ============

// 只订阅 count，name 变化时不重渲染
// memo：隔离父组件重渲染，确保只有 Zustand 的 count 变化才触发渲染
const CountDisplay = memo(() => {
  const count = useSelectorStore((state) => state.count)
  const renderCount = useRef(0)
  renderCount.current++

  return (
    <Card
      size="small"
      title="CountDisplay"
      style={{ borderRadius: 8, border: '2px solid #1677ff' }}
    >
      <Space direction="vertical">
        <Text>
          订阅字段：<Tag color="blue">count</Tag>
        </Text>
        <Text>
          count 值：
          <Text strong style={{ fontSize: 20 }}>
            {count}
          </Text>
        </Text>
        <Text type="secondary">
          渲染次数：<Tag color="red">{renderCount.current}</Tag>
        </Text>
      </Space>
    </Card>
  )
})

// 只订阅 name，count 变化时不重渲染
const NameDisplay = memo(() => {
  const name = useSelectorStore((state) => state.name)
  const renderCount = useRef(0)
  renderCount.current++

  return (
    <Card
      size="small"
      title="NameDisplay"
      style={{ borderRadius: 8, border: '2px solid #52c41a' }}
    >
      <Space direction="vertical">
        <Text>
          订阅字段：<Tag color="green">name</Tag>
        </Text>
        <Text>
          name 值：
          <Text strong style={{ fontSize: 20 }}>
            {name}
          </Text>
        </Text>
        <Text type="secondary">
          渲染次数：<Tag color="red">{renderCount.current}</Tag>
        </Text>
      </Space>
    </Card>
  )
})

// 不用 selector，订阅整个 state，任何字段变化都重渲染
const FullSubscribe = memo(() => {
  const { count, name } = useSelectorStore()
  const renderCount = useRef(0)
  renderCount.current++

  return (
    <Card
      size="small"
      title="FullSubscribe（无 selector）"
      style={{ borderRadius: 8, border: '2px solid #ff4d4f' }}
    >
      <Space direction="vertical">
        <Text>
          订阅字段：<Tag color="red">整个 state</Tag>
        </Text>
        <Text>
          count：{count}，name：{name}
        </Text>
        <Text type="secondary">
          渲染次数：<Tag color="red">{renderCount.current}</Tag>
          {/* count 或 name 任意变化都会增加 */}
        </Text>
      </Space>
    </Card>
  )
})

// 子组件 精确订阅vs 全量订阅
const SelectorDemo: React.FC = () => {
  const increment = useSelectorStore((state) => state.increment)
  const setName = useSelectorStore((state) => state.setName)
  const [inputName, setInputName] = useState('李四')

  return (
    <Card
      title="精确订阅 vs 全量订阅（观察渲染次数）"
      style={{ borderRadius: 8 }}
    >
      <Alert
        message="点击按钮后观察：蓝色组件只在 count 变化时渲染，绿色只在 name 变化时渲染，红色任意变化都渲染"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Space style={{ marginBottom: 16 }}>
        {/* 只改 count，NameDisplay 不应该重渲染 */}
        <Button type="primary" onClick={increment}>
          count + 1
        </Button>
        {/* 只改 name，CountDisplay 不应该重渲染 */}
        <Input
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          style={{ width: 120 }}
        />
        <Button onClick={() => setName(inputName)}>修改 name</Button>
      </Space>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <CountDisplay />
        </Col>
        <Col xs={24} md={8}>
          <NameDisplay />
        </Col>
        <Col xs={24} md={8}>
          <FullSubscribe />
        </Col>
      </Row>
      <Alert
        style={{ marginTop: 16 }}
        message={
          <span>
            精确订阅写法：<Text code>{'useStore(state => state.count)'}</Text>
            &nbsp;&nbsp;全量订阅写法：<Text code>{'useStore()'}</Text>
          </span>
        }
        type="warning"
      />
    </Card>
  )
}

const products = [
  { id: 1, name: 'MacBook Pro', price: 12999 },
  { id: 2, name: 'iPhone 15', price: 5999 },
  { id: 3, name: 'AirPods Pro', price: 1799 },
  { id: 4, name: 'iPad Air', price: 4799 }
]

const ZustandDemo: React.FC = () => {
  const { items, addItem, removeItem, updateQty, clearCart, total } =
    useCartStore()

  const cartColumns: ColumnsType<(typeof items)[0]> = [
    { title: '商品', dataIndex: 'name' },
    { title: '单价', dataIndex: 'price', render: (v) => `¥${v}` },
    {
      title: '数量',
      dataIndex: 'qty',
      render: (v, record) => (
        <InputNumber
          min={0}
          value={v}
          onChange={(n) => updateQty(record.id, n ?? 0)}
          size="small"
        />
      )
    },
    { title: '小计', render: (_, r) => <Text strong>¥{r.price * r.qty}</Text> },
    {
      title: '操作',
      render: (_, r) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(r.id)}
        />
      )
    }
  ]

  return (
    <div>
      <Title level={3}>Zustand 状态管理</Title>
      <Paragraph>
        <Tag color="orange">create</Tag>
        <Tag color="orange">persist</Tag>
        无需 Provider 包裹，store 刷新后依然保持（localStorage 持久化）。
      </Paragraph>

      <Alert
        message="Zustand vs Redux：Zustand API 极简，适合中小规模；Redux Toolkit 更适合大型应用（时间旅行调试、中间件生态）"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <SelectorDemo />
      {/* 购物车 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={10}>
          <Card title="商品列表" style={{ borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {products.map((p) => (
                <Card.Grid
                  key={p.id}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => addItem(p)}
                >
                  <Space
                    style={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <Text>{p.name}</Text>
                    <Space>
                      <Text type="danger">¥{p.price}</Text>
                      <Button
                        size="small"
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                      >
                        加购
                      </Button>
                    </Space>
                  </Space>
                </Card.Grid>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <Card
            title={
              <>
                <ShoppingCartOutlined /> 购物车 ({items.length} 种商品)
              </>
            }
            extra={
              <Button
                size="small"
                danger
                icon={<ClearOutlined />}
                onClick={clearCart}
              >
                清空
              </Button>
            }
            style={{ borderRadius: 8 }}
          >
            <Table
              size="small"
              dataSource={items}
              columns={cartColumns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: '购物车为空，点击左侧商品添加' }}
            />
            <Divider dashed />
            <div style={{ textAlign: 'right' }}>
              <Text>合计: </Text>
              <Text strong style={{ fontSize: 20, color: '#f5222d' }}>
                ¥{total()}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ZustandDemo
