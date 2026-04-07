import React from 'react'
import { useCartStore } from './store'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography

const products = [
  { id: 1, name: 'MacBook Pro', price: 12999 },
  { id: 2, name: 'iPhone 15', price: 5999 },
  { id: 3, name: 'AirPods Pro', price: 1799 },
  { id: 4, name: 'iPad Air', price: 4799 },
]

const ZustandDemo: React.FC = () => {
  const { items, addItem, removeItem, updateQty, clearCart, total } = useCartStore()

  const cartColumns: ColumnsType<typeof items[0]> = [
    { title: '商品', dataIndex: 'name' },
    { title: '单价', dataIndex: 'price', render: (v) => `¥${v}` },
    {
      title: '数量',
      dataIndex: 'qty',
      render: (v, record) => (
        <InputNumber min={0} value={v} onChange={(n) => updateQty(record.id, n ?? 0)} size="small" />
      ),
    },
    { title: '小计', render: (_, r) => <Text strong>¥{r.price * r.qty}</Text> },
    {
      title: '操作',
      render: (_, r) => (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeItem(r.id)} />
      ),
    },
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

      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Card title="商品列表" style={{ borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {products.map((p) => (
                <Card.Grid
                  key={p.id}
                  style={{ width: '100%', padding: '10px 16px', cursor: 'pointer' }}
                  onClick={() => addItem(p)}
                >
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Text>{p.name}</Text>
                    <Space>
                      <Text type="danger">¥{p.price}</Text>
                      <Button size="small" type="primary" icon={<ShoppingCartOutlined />}>
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
            title={<><ShoppingCartOutlined /> 购物车 ({items.length} 种商品)</>}
            extra={
              <Button size="small" danger icon={<ClearOutlined />} onClick={clearCart}>
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
              <Text strong style={{ fontSize: 20, color: '#f5222d' }}>¥{total()}</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ZustandDemo
