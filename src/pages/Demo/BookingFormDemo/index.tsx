import dayjs, { type Dayjs } from 'dayjs'
import { Checkbox, DatePicker, Radio } from 'antd'

// ─── Mock Data ─────────────────────────────────────────────────────────────

interface RoomType {
  id: string
  name: string
  price: number
}
interface RoomOption {
  id: string
  name: string
}
interface RoomRow {
  id: string
  roomTypeId: string
  roomId: string
  checkIn: Dayjs | null
  checkOut: Dayjs | null
  availableRooms: RoomOption[]
  loadingRooms: boolean
  conflictError: string
}
type PaymentMode = 'on_arrival' | 'prepay' | 'credit'

const ROOM_TYPES: RoomType[] = [
  { id: 'standard', name: '标准间', price: 288 },
  { id: 'deluxe', name: '豪华大床房', price: 488 },
  { id: 'suite', name: '商务套房', price: 888 },
  { id: 'family', name: '家庭房', price: 668 },
]

const ROOM_POOL: Record<string, RoomOption[]> = {
  standard: [{ id: '101', name: '101' }, { id: '102', name: '102' }, { id: '103', name: '103' }],
  deluxe: [{ id: '201', name: '201' }, { id: '202', name: '202' }],
  suite: [{ id: '301', name: '301（演示冲突）' }, { id: '302', name: '302' }],
  family: [{ id: '401', name: '401' }, { id: '402', name: '402' }],
}

const SVC = { breakfast: 38, parking: 50, pickup: 200 }

// ─── Helpers ───────────────────────────────────────────────────────────────

let _rowId = 0
const newRow = (): RoomRow => ({
  id: `row-${++_rowId}`,
  roomTypeId: '', roomId: '',
  checkIn: null, checkOut: null,
  availableRooms: [], loadingRooms: false, conflictError: '',
})

const getNights = (ci: Dayjs | null, co: Dayjs | null) =>
  ci && co ? Math.max(0, co.diff(ci, 'day')) : 0

const getRoomPrice = (typeId: string) =>
  ROOM_TYPES.find(t => t.id === typeId)?.price ?? 0

// ─── FormItem ──────────────────────────────────────────────────────────────

const FormItem = ({
  label, required, error, children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) => (
  <div>
    <div style={{ marginBottom: 4, fontSize: 13 }}>
      {required && <span style={{ color: '#ff4d4f', marginRight: 2 }}>*</span>}
      {label}
    </div>
    {children}
    {error && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 2 }}>{error}</div>}
  </div>
)

// ─── RoomRowCard ───────────────────────────────────────────────────────────

interface RowCardProps {
  room: RoomRow
  index: number
  errors: Record<string, string>
  canRemove: boolean
  onTypeChange: (id: string, typeId: string) => void
  onRoomChange: (id: string, roomId: string) => void
  onDateChange: (id: string, field: 'checkIn' | 'checkOut', d: Dayjs | null) => void
  onRemove: (id: string) => void
}

const RoomRowCard = ({
  room, index, errors, canRemove,
  onTypeChange, onRoomChange, onDateChange, onRemove,
}: RowCardProps) => {
  const nights = getNights(room.checkIn, room.checkOut)
  const price = getRoomPrice(room.roomTypeId)
  const isConflict = !!room.conflictError

  return (
    <Card
      size="small"
      style={{
        border: isConflict ? '1px solid #ff4d4f' : undefined,
        background: isConflict ? '#fff1f0' : undefined,
      }}
      title={
        <Space>
          <span>房间 {index + 1}</span>
          {isConflict && <Tag color="error">房态冲突</Tag>}
        </Space>
      }
      extra={
        canRemove
          ? <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => onRemove(room.id)}>删除</Button>
          : null
      }
    >
      {isConflict && (
        <Alert type="error" message={room.conflictError} showIcon style={{ marginBottom: 12 }} />
      )}
      <Row gutter={[12, 8]}>
        <Col span={6}>
          <FormItem label="房型" required error={errors[`${room.id}.roomTypeId`]}>
            <Select
              style={{ width: '100%' }}
              value={room.roomTypeId || undefined}
              onChange={v => onTypeChange(room.id, v)}
              placeholder="选择房型"
              status={errors[`${room.id}.roomTypeId`] ? 'error' : ''}
              options={ROOM_TYPES.map(t => ({ value: t.id, label: `${t.name}  ¥${t.price}/晚` }))}
            />
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem label="房间号" required error={errors[`${room.id}.roomId`]}>
            <Select
              style={{ width: '100%' }}
              value={room.roomId || undefined}
              onChange={v => onRoomChange(room.id, v)}
              placeholder={room.loadingRooms ? '加载中…' : room.roomTypeId ? '选择房间' : '先选房型'}
              disabled={!room.roomTypeId}
              loading={room.loadingRooms}
              status={errors[`${room.id}.roomId`] ? 'error' : ''}
              options={room.availableRooms.map(r => ({ value: r.id, label: r.name }))}
            />
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem label="入住日期" required error={errors[`${room.id}.checkIn`]}>
            <DatePicker
              style={{ width: '100%' }}
              value={room.checkIn}
              onChange={d => onDateChange(room.id, 'checkIn', d)}
              placeholder="入住日期"
              status={errors[`${room.id}.checkIn`] ? 'error' : ''}
              disabledDate={d => d.isBefore(dayjs().startOf('day'))}
            />
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem label="离店日期" required error={errors[`${room.id}.checkOut`]}>
            <DatePicker
              style={{ width: '100%' }}
              value={room.checkOut}
              onChange={d => onDateChange(room.id, 'checkOut', d)}
              placeholder="离店日期"
              status={errors[`${room.id}.checkOut`] ? 'error' : ''}
              disabledDate={d =>
                room.checkIn
                  ? !d.isAfter(room.checkIn)
                  : d.isBefore(dayjs().startOf('day'))
              }
            />
          </FormItem>
        </Col>
        <Col span={4} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
          <Space direction="vertical" size={2}>
            <Tag color={nights > 0 ? 'blue' : 'default'}>{nights > 0 ? `${nights} 晚` : '— 晚'}</Tag>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {price > 0 && nights > 0 ? `¥${price} × ${nights} = ¥${price * nights}` : '—'}
            </Typography.Text>
          </Space>
        </Col>
      </Row>
    </Card>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

const BookingFormDemo = () => {
  // 入住人
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  // 房间列表（动态增减）
  const [rooms, setRooms] = useState<RoomRow[]>([newRow()])

  // 增值服务
  const [hasBf, setHasBf] = useState(false)
  const [bfGuests, setBfGuests] = useState(1)
  const [hasParking, setHasParking] = useState(false)
  const [parkDays, setParkDays] = useState(1)
  const [hasPickup, setHasPickup] = useState(false)
  const [pickupCount, setPickupCount] = useState(1)

  // 支付方式
  const [payMode, setPayMode] = useState<PaymentMode>('on_arrival')
  const [prepayRatio, setPrepayRatio] = useState(50)
  const [creditAcc, setCreditAcc] = useState('')

  // 表单状态
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const clearErr = (key: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n })

  // ── 房间操作 ──────────────────────────────────────────────────────────────

  const addRoom = () => setRooms(prev => [...prev, newRow()])

  const removeRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id))
    setErrors(prev => {
      const n = { ...prev }
      Object.keys(n).filter(k => k.startsWith(id)).forEach(k => delete n[k])
      return n
    })
  }

  // 房型切换：清空房间 + 模拟异步拉取可用房间
  const handleTypeChange = (id: string, typeId: string) => {
    setRooms(prev => prev.map(r =>
      r.id === id
        ? { ...r, roomTypeId: typeId, roomId: '', availableRooms: [], loadingRooms: true, conflictError: '' }
        : r
    ))
    clearErr(`${id}.roomTypeId`)
    clearErr(`${id}.roomId`)
    setTimeout(() => {
      setRooms(prev => prev.map(r =>
        r.id === id ? { ...r, availableRooms: ROOM_POOL[typeId] ?? [], loadingRooms: false } : r
      ))
    }, 600)
  }

  const handleRoomChange = (id: string, roomId: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, roomId, conflictError: '' } : r))
    clearErr(`${id}.roomId`)
  }

  // 日期变化：入住日期修改时若离店日期失效则自动清除
  const handleDateChange = (id: string, field: 'checkIn' | 'checkOut', date: Dayjs | null) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== id) return r
      const patch: Partial<RoomRow> = { [field]: date, conflictError: '' }
      if (field === 'checkIn' && date && r.checkOut && !r.checkOut.isAfter(date)) {
        patch.checkOut = null
      }
      return { ...r, ...patch }
    }))
    clearErr(`${id}.${field}`)
  }

  // ── 计算 ──────────────────────────────────────────────────────────────────

  // 最大入住晚数（供早餐等按天计算用）
  const stayNights = useMemo(() => {
    const ns = rooms.map(r => getNights(r.checkIn, r.checkOut))
    return ns.length ? Math.max(0, ...ns) : 0
  }, [rooms])

  const roomTotal = useMemo(() =>
    rooms.reduce((s, r) => s + getRoomPrice(r.roomTypeId) * getNights(r.checkIn, r.checkOut), 0)
  , [rooms])

  const svcTotal = useMemo(() => {
    const b = hasBf ? SVC.breakfast * bfGuests * stayNights : 0
    const p = hasParking ? SVC.parking * parkDays : 0
    const t = hasPickup ? SVC.pickup * pickupCount : 0
    return b + p + t
  }, [hasBf, bfGuests, stayNights, hasParking, parkDays, hasPickup, pickupCount])

  const grandTotal = roomTotal + svcTotal
  const prepayAmt = payMode === 'prepay' ? Math.round(grandTotal * prepayRatio / 100) : 0

  // ── 校验 ──────────────────────────────────────────────────────────────────

  const validate = () => {
    const e: Record<string, string> = {}
    if (!guestName.trim()) e.guestName = '请填写入住人姓名'
    if (!guestPhone.trim()) e.guestPhone = '请填写联系电话'
    else if (!/^1[3-9]\d{9}$/.test(guestPhone)) e.guestPhone = '手机号格式不正确'

    rooms.forEach(r => {
      if (!r.roomTypeId) e[`${r.id}.roomTypeId`] = '请选择房型'
      if (r.roomTypeId && !r.roomId) e[`${r.id}.roomId`] = '请选择房间'
      if (!r.checkIn) e[`${r.id}.checkIn`] = '请选择入住日期'
      if (!r.checkOut) e[`${r.id}.checkOut`] = '请选择离店日期'
    })

    if (payMode === 'credit' && !creditAcc.trim()) {
      e.creditAcc = '请填写挂账单位名称'
    }
    return e
  }

  // 模拟服务端房态冲突校验（301 号房始终冲突，用于演示）
  const mockConflictCheck = (curRooms: RoomRow[]): Promise<string[]> =>
    new Promise(res =>
      setTimeout(() => res(curRooms.filter(r => r.roomId === '301').map(r => r.id)), 1200)
    )

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setErrors({})

    const conflictIds = await mockConflictCheck(rooms)
    setSubmitting(false)

    if (conflictIds.length) {
      setRooms(prev => prev.map(r => ({
        ...r,
        conflictError: conflictIds.includes(r.id) ? '该房间在所选日期已被预订，请更换' : '',
      })))
      return
    }
    setDone(true)
  }

  const reset = () => {
    setGuestName(''); setGuestPhone('')
    setRooms([newRow()])
    setHasBf(false); setBfGuests(1)
    setHasParking(false); setParkDays(1)
    setHasPickup(false); setPickupCount(1)
    setPayMode('on_arrival'); setPrepayRatio(50); setCreditAcc('')
    setErrors({}); setDone(false)
  }

  // ── 成功页 ────────────────────────────────────────────────────────────────

  if (done) {
    return (
      <div>
        <Typography.Title level={3}>酒店预订单 — 复杂表单 Demo</Typography.Title>
        <Alert
          type="success"
          showIcon
          message="预订成功！"
          description={`入住人：${guestName} | 房间数：${rooms.length} 间 | 总金额：¥${grandTotal}`}
          style={{ marginBottom: 16 }}
        />
        <Button onClick={reset}>重新预订</Button>
      </div>
    )
  }

  // ── 表单 ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <Typography.Title level={3}>酒店预订单 — 复杂表单 Demo</Typography.Title>
      <Typography.Paragraph>
        <Tag color="blue">动态增删行</Tag>
        <Tag color="green">房型→房间级联</Tag>
        <Tag color="orange">日期联动计算房晚</Tag>
        <Tag color="purple">支付方式条件校验</Tag>
        <Tag color="red">服务端房态冲突校验</Tag>
      </Typography.Paragraph>

      {/* ① 入住人信息 */}
      <Card title="① 入住人信息" style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem label="入住人姓名" required error={errors.guestName}>
              <Input
                value={guestName}
                onChange={e => { setGuestName(e.target.value); clearErr('guestName') }}
                placeholder="请输入姓名"
                status={errors.guestName ? 'error' : ''}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="联系电话" required error={errors.guestPhone}>
              <Input
                value={guestPhone}
                onChange={e => { setGuestPhone(e.target.value); clearErr('guestPhone') }}
                placeholder="请输入手机号"
                status={errors.guestPhone ? 'error' : ''}
              />
            </FormItem>
          </Col>
        </Row>
      </Card>

      {/* ② 房间配置 */}
      <Card
        title={`② 房间配置（共 ${rooms.length} 间）`}
        style={{ marginBottom: 16 }}
        extra={
          <Button type="dashed" icon={<PlusOutlined />} onClick={addRoom}>
            添加房间
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {rooms.map((room, idx) => (
            <RoomRowCard
              key={room.id}
              room={room}
              index={idx}
              errors={errors}
              canRemove={rooms.length > 1}
              onTypeChange={handleTypeChange}
              onRoomChange={handleRoomChange}
              onDateChange={handleDateChange}
              onRemove={removeRoom}
            />
          ))}
        </Space>
      </Card>

      {/* ③ 增值服务 */}
      <Card title="③ 增值服务" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Checkbox checked={hasBf} onChange={e => setHasBf(e.target.checked)}>
              早餐&nbsp;
              <Typography.Text type="secondary">¥{SVC.breakfast} / 人 / 天</Typography.Text>
            </Checkbox>
            {hasBf && (
              <Space>
                <span>人数</span>
                <InputNumber min={1} max={20} value={bfGuests} onChange={v => setBfGuests(v ?? 1)} style={{ width: 64 }} />
                <Typography.Text type="secondary">
                  × {stayNights} 天 = ¥{SVC.breakfast * bfGuests * stayNights}
                </Typography.Text>
              </Space>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Checkbox checked={hasParking} onChange={e => setHasParking(e.target.checked)}>
              停车位&nbsp;
              <Typography.Text type="secondary">¥{SVC.parking} / 天</Typography.Text>
            </Checkbox>
            {hasParking && (
              <Space>
                <span>天数</span>
                <InputNumber min={1} max={30} value={parkDays} onChange={v => setParkDays(v ?? 1)} style={{ width: 64 }} />
                <Typography.Text type="secondary">= ¥{SVC.parking * parkDays}</Typography.Text>
              </Space>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Checkbox checked={hasPickup} onChange={e => setHasPickup(e.target.checked)}>
              机场接送&nbsp;
              <Typography.Text type="secondary">¥{SVC.pickup} / 次</Typography.Text>
            </Checkbox>
            {hasPickup && (
              <Space>
                <span>次数</span>
                <InputNumber min={1} max={10} value={pickupCount} onChange={v => setPickupCount(v ?? 1)} style={{ width: 64 }} />
                <Typography.Text type="secondary">= ¥{SVC.pickup * pickupCount}</Typography.Text>
              </Space>
            )}
          </div>
        </Space>
      </Card>

      {/* ④ 支付方式 */}
      <Card title="④ 支付方式" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={12}>
          <Radio.Group
            value={payMode}
            onChange={e => { setPayMode(e.target.value); clearErr('creditAcc') }}
          >
            <Radio value="on_arrival">到店付款</Radio>
            <Radio value="prepay">在线预付</Radio>
            <Radio value="credit">挂账结算</Radio>
          </Radio.Group>

          {payMode === 'prepay' && (
            <Space align="center">
              <span>预付比例：</span>
              <Radio.Group value={prepayRatio} onChange={e => setPrepayRatio(e.target.value)}>
                <Radio.Button value={20}>20%</Radio.Button>
                <Radio.Button value={50}>50%</Radio.Button>
                <Radio.Button value={100}>全额</Radio.Button>
              </Radio.Group>
              <Tag color="orange" style={{ marginLeft: 8 }}>需预付 ¥{prepayAmt}</Tag>
            </Space>
          )}

          {payMode === 'credit' && (
            <FormItem label="挂账单位" required error={errors.creditAcc}>
              <Input
                style={{ width: 300 }}
                value={creditAcc}
                onChange={e => { setCreditAcc(e.target.value); clearErr('creditAcc') }}
                placeholder="请输入挂账单位名称"
                status={errors.creditAcc ? 'error' : ''}
              />
            </FormItem>
          )}
        </Space>
      </Card>

      {/* ⑤ 费用汇总 + 提交 */}
      <Card title="⑤ 费用汇总">
        <Row gutter={24}>
          <Col span={14}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {rooms.map(r => {
                const n = getNights(r.checkIn, r.checkOut)
                const p = getRoomPrice(r.roomTypeId)
                const typeName = ROOM_TYPES.find(t => t.id === r.roomTypeId)?.name ?? '未选择'
                return (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography.Text>
                      {typeName}{r.roomId ? ` ${r.roomId}号` : ''} × {n} 晚
                    </Typography.Text>
                    <Typography.Text>¥{p * n}</Typography.Text>
                  </div>
                )
              })}
              {hasBf && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text type="secondary">早餐 × {bfGuests} 人 × {stayNights} 天</Typography.Text>
                  <Typography.Text type="secondary">¥{SVC.breakfast * bfGuests * stayNights}</Typography.Text>
                </div>
              )}
              {hasParking && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text type="secondary">停车位 × {parkDays} 天</Typography.Text>
                  <Typography.Text type="secondary">¥{SVC.parking * parkDays}</Typography.Text>
                </div>
              )}
              {hasPickup && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text type="secondary">机场接送 × {pickupCount} 次</Typography.Text>
                  <Typography.Text type="secondary">¥{SVC.pickup * pickupCount}</Typography.Text>
                </div>
              )}
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Text strong style={{ fontSize: 15 }}>合计</Typography.Text>
                <Typography.Text strong style={{ fontSize: 22, color: '#f5222d' }}>
                  ¥{grandTotal}
                </Typography.Text>
              </div>
              {payMode === 'prepay' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text type="secondary">本次预付（{prepayRatio}%）</Typography.Text>
                  <Typography.Text type="secondary">¥{prepayAmt}</Typography.Text>
                </div>
              )}
            </Space>
          </Col>

          <Col span={10} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <Space direction="vertical" align="end">
              {submitting && (
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  正在与服务端校验房态…
                </Typography.Text>
              )}
              <Space>
                <Button onClick={reset}>重置</Button>
                <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>
                  提交预订
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default BookingFormDemo
