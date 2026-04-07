import type { FC, ReactNode, Dispatch, SetStateAction } from 'react'

interface SlotDemoProps {
  // 可以定义一些 props 来控制插槽内容
  title?: string
  description?: string
  constFather: number
  setConstFather: Dispatch<SetStateAction<number>>
  renderContent?: (count: number) => ReactNode // 可选：父组件传入渲染函数
}
const SlotDemo: FC<SlotDemoProps> = ({
  title,
  description,
  constFather,
  setConstFather,
  renderContent
}) => {
  const [SlotCount, setSlotCount] = useState(0)
  return (
    <div style={{ padding: 16, background: '#f0f2f5', borderRadius: 4 }}>
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {renderContent && renderContent(SlotCount)}
      <Button onClick={() => setSlotCount(SlotCount + 1)}>插槽按钮</Button>
      <Button onClick={() => setConstFather(constFather + 1)}>
        插槽按钮 修改父组件的值
      </Button>
    </div>
  )
}
export default SlotDemo
