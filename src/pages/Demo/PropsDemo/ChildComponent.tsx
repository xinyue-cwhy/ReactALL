import type { FC, ReactNode } from "react";
import SlotDemo from "./SlotDemo";

const { Text } = Typography;

export interface ChildProps {
  message: string; // 父 -> 子: props
  count: number;
  renderCount?: () => ReactNode; // 可选：父组件传入渲染函数
  onCountChange: (n: number) => void; // 子 -> 父: 回调
  onSendMessage: (msg: string) => void;
}

const ChildComponent: FC<ChildProps> = ({
  message,
  count,
  renderCount,
  onCountChange,
  onSendMessage,
}) => {
  const [input, setInput] = useState("");
  const [constFather, setConstFather] = useState(0);
  function countChangeHandle(params: number) {
    if (params > 10 || params < 0) {
      return;
    }
    onCountChange(params);
  }
  return (
    <Card
      title={
        <>
          <ArrowDownOutlined style={{ color: "#1677ff" }} /> 子组件
          (ChildComponent)
        </>
      }
      style={{ border: "2px solid #1677ff", borderRadius: 8 }}
    >
      <div>{renderCount?.()}</div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Alert
          message={
            <>
              父组件传来的消息: <Text strong>{message}</Text>
            </>
          }
          type="info"
          showIcon
        />
        <Alert
          message={
            <>
              父组件传来的 count: <Text strong>{count}</Text>
            </>
          }
          type="success"
          showIcon
        />

        <Divider dashed>插槽演示（类比 Vue slot）</Divider>
        <SlotDemo
          title="我准别写插槽"
          constFather={constFather}
          setConstFather={setConstFather}
          renderContent={(count) => (
            <div>
              <p>这是插槽内容{count}</p>
              <p>这是父组件传入的值: {constFather}</p>
            </div>
          )}
        />
        <SlotDemo
          title="我准别写插槽"
          constFather={constFather}
          setConstFather={setConstFather}
          renderContent={(count) => (
            <div>
              <p>这是插槽内容{count}</p>
              <p>这是父组件传入的值: {constFather}</p>
            </div>
          )}
        />

        <Divider dashed>子 → 父：通过回调函数</Divider>

        <Space>
          <Button onClick={() => countChangeHandle(count - 1)}>
            count - 1
          </Button>
          <Button type="primary" onClick={() => countChangeHandle(count + 1)}>
            count + 1
          </Button>
        </Space>

        <Input
          placeholder="子组件输入内容发送给父组件"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={() => {
            onSendMessage(input);
            setInput("");
          }}
          addonAfter={
            <Button
              type="link"
              size="small"
              onClick={() => {
                onSendMessage(input);
                setInput("");
              }}
            >
              发送
            </Button>
          }
        />
      </Space>
    </Card>
  );
};

export default ChildComponent;
