import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch'
import {
  increment, decrement, incrementByAmount, reset, setStep,
} from '../../../store/slices/counterSlice'
import { fetchUsers, selectUser } from '../../../store/slices/userSlice'
import type { User } from '../../../types'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography

const columns: ColumnsType<User> = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '姓名', dataIndex: 'name' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '网站', dataIndex: 'website', render: (v) => v || '-' },
]

const ReduxDemo: React.FC = () => {
  const dispatch = useAppDispatch()

  // useSelector 订阅 store
  const { value, step, history } = useAppSelector((s) => s.counter)
  const { list, loading, error, selected } = useAppSelector((s) => s.users)

  return (
    <div>
      <Title level={3}>Redux Toolkit 全局状态</Title>
      <Paragraph>
        <Tag color="purple">createSlice</Tag>
        <Tag color="purple">createAsyncThunk</Tag>
        <Tag color="purple">useSelector</Tag>
        <Tag color="purple">useDispatch</Tag>
        所有组件共享同一 store，无需 props 传递。
      </Paragraph>

      <Row gutter={[16, 16]}>
        {/* 计数器 slice */}
        <Col xs={24} md={12}>
          <Card title={<><ThunderboltOutlined /> Counter Slice</>} style={{ borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', fontSize: 48, fontWeight: 700, color: '#722ed1' }}>
                {value}
              </div>

              <Space wrap>
                <Button icon={<MinusOutlined />} onClick={() => dispatch(decrement())}>-{step}</Button>
                <Button icon={<PlusOutlined />} type="primary" onClick={() => dispatch(increment())}>+{step}</Button>
                <Button icon={<ReloadOutlined />} danger onClick={() => dispatch(reset())}>重置</Button>
              </Space>

              <Space>
                <Text>步长:</Text>
                <InputNumber
                  min={1} max={100} value={step}
                  onChange={(v) => dispatch(setStep(v ?? 1))}
                />
                <Button onClick={() => dispatch(incrementByAmount(10))}>+10</Button>
              </Space>

              <Divider dashed>操作历史</Divider>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {history.map((v, i) => (
                  <Tag key={i} color={i === history.length - 1 ? 'purple' : 'default'}>{v}</Tag>
                ))}
              </div>
            </Space>
          </Card>
        </Col>

        {/* 用户 slice + createAsyncThunk */}
        <Col xs={24} md={12}>
          <Card
            title="User Slice + createAsyncThunk"
            extra={
              <Button size="small" type="primary" loading={loading} onClick={() => dispatch(fetchUsers())}>
                异步拉取用户
              </Button>
            }
            style={{ borderRadius: 8 }}
          >
            {error && <Alert message={error} type="error" showIcon />}
            {selected && (
              <Alert
                message={<>已选中: <Text strong>{selected.name}</Text> — {selected.email}</>}
                type="info"
                showIcon
                style={{ marginBottom: 8 }}
              />
            )}
            <Spin spinning={loading}>
              <Table
                size="small"
                dataSource={list.slice(0, 5)}
                columns={columns}
                rowKey="id"
                pagination={false}
                onRow={(record) => ({ onClick: () => dispatch(selectUser(record)) })}
                locale={{ emptyText: '点击上方按钮加载数据' }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReduxDemo
