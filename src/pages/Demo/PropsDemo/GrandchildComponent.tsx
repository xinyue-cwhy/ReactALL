import React from 'react'

const { Text } = Typography

export interface GrandchildProps {
  value: string
}

const GrandchildComponent: React.FC<GrandchildProps> = ({ value }) => (
  <Card
    title="孙子组件 (GrandchildComponent)"
    size="small"
    style={{ border: '2px dashed #52c41a', borderRadius: 8 }}
  >
    <Text>
      接收到的 value: <Tag color="green">{value || '(空)'}</Tag>
    </Text>
  </Card>
)

export default GrandchildComponent
