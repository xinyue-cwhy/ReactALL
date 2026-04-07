import { useState } from "react";
import ChildComponent from "./ChildComponent";
import GrandchildComponent from "./GrandchildComponent";

const { Title, Text, Paragraph } = Typography;

const PropsDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("你好，子组件！");
  const [fromChild, setFromChild] = useState("");

  const submitHandler = (_state: unknown, formData: FormData) => {
    console.log({
      username: formData.get("username"),
      password: formData.get("password"),
    });
    return {};
  };
  const [state, submitAction, isPending] = useActionState(submitHandler, null);
  console.log(state, isPending);

  return (
    <div>
      <Title level={3}>Props 父子通信</Title>
      <Paragraph>
        <Tag color="blue">父 → 子</Tag> 通过 <Text code>props</Text> 传递数据
        &nbsp;
        <Tag color="green">子 → 父</Tag> 通过<Text code>回调函数</Text>
        通知父组件
      </Paragraph>
      <form action={submitAction}>
        <input type="text" name="username" placeholder="用户名" />
        <input name="password" type="password" placeholder="密码" />
        <button type="submit">提交</button>
      </form>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <>
                <ArrowUpOutlined style={{ color: "#52c41a" }} /> 父组件
                (ParentComponent)
              </>
            }
            style={{ border: "2px solid #52c41a", borderRadius: 8 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
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
                    从子组件收到:{" "}
                    <Text strong>{fromChild || "(等待子组件发送...)"}</Text>
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
  );
};

export default PropsDemo;
