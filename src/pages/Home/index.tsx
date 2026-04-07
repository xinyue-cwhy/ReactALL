import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const demos = [
  {
    key: "/demo/props",
    icon: <NodeIndexOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
    title: "Props 父子通信",
    desc: "父组件通过 props 向子组件传递数据，子组件通过回调函数向父组件通信。",
    tags: ["props", "callback", "useState"],
    color: "#e6f4ff",
  },
  {
    key: "/demo/context",
    icon: <GlobalOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
    title: "Context 跨层通信",
    desc: "使用 createContext + useContext + useReducer 实现跨层级组件通信。",
    tags: ["createContext", "useContext", "useReducer"],
    color: "#f6ffed",
  },
  {
    key: "/demo/redux",
    icon: <ThunderboltOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
    title: "Redux 全局状态",
    desc: "Redux Toolkit：createSlice、createAsyncThunk、useSelector、useDispatch。",
    tags: ["Redux Toolkit", "createSlice", "createAsyncThunk"],
    color: "#f9f0ff",
  },
  {
    key: "/demo/zustand",
    icon: <ShareAltOutlined style={{ fontSize: 32, color: "#fa8c16" }} />,
    title: "Zustand 状态管理",
    desc: "轻量级状态管理，无 Provider 包裹，API 简洁，适合中小项目。",
    tags: ["zustand", "create", "immer"],
    color: "#fff7e6",
  },
  {
    key: "/demo/ref",
    icon: <RetweetOutlined style={{ fontSize: 32, color: "#eb2f96" }} />,
    title: "Ref 命令式通信",
    desc: "使用 useRef、forwardRef、useImperativeHandle 实现父调子方法。",
    tags: ["useRef", "forwardRef", "useImperativeHandle"],
    color: "#fff0f6",
  },
  {
    key: "/demo/eventbus",
    icon: <ApiOutlined style={{ fontSize: 32, color: "#13c2c2" }} />,
    title: "EventBus 发布订阅",
    desc: "基于 mitt 实现事件总线，兄弟组件或任意组件间解耦通信。",
    tags: ["mitt", "emit", "on/off"],
    color: "#e6fffb",
  },
  {
    key: "/demo/query",
    icon: <FunctionOutlined style={{ fontSize: 32, color: "#f5222d" }} />,
    title: "React Query + Axios",
    desc: "使用 TanStack Query 管理服务端状态，配合 Axios 拦截器处理请求。",
    tags: ["useQuery", "useMutation", "axios"],
    color: "#fff1f0",
  },
  {
    key: "/demo/suspense",
    icon: <FunctionOutlined style={{ fontSize: 32, color: "#fa541c" }} />,
    title: "React Suspense",
    desc: "React 18 Suspense 组件，配合 lazy 和 Suspense 实现组件级别的加载状态。",
    tags: ["Suspense", "lazy", "fallback"],
    color: "#fff7e6",
  },
  {
    key: "/demo/form",
    icon: <FunctionOutlined style={{ fontSize: 32, color: "#2f54eb" }} />,
    title: "受控表单",
    desc: "使用 useState 管理表单数据，提交时统一校验，输入时实时清除错误提示。",
    tags: ["useState", "受控组件", "表单校验"],
    color: "#f0f5ff",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Title level={2}>React 全家桶演示项目</Title>
      <Paragraph>
        本项目使用 <Text code>React 18</Text> + <Text code>Vite</Text> +{" "}
        <Text code>TypeScript</Text> 搭建， 涵盖 React
        全家桶核心技术栈，演示所有组件通信方式。
      </Paragraph>

      <Divider>技术栈</Divider>
      <Space wrap style={{ marginBottom: 24 }}>
        {[
          "React 18",
          "Vite 5",
          "TypeScript",
          "React Router v6",
          "Redux Toolkit",
          "Zustand",
          "TanStack Query",
          "Axios",
          "Ant Design 5",
          "mitt",
        ].map((t) => (
          <Tag color="blue" key={t}>
            {t}
          </Tag>
        ))}
      </Space>

      <Divider>通信方式演示</Divider>
      <Row gutter={[16, 16]}>
        {demos.map((d) => (
          <Col xs={24} sm={12} lg={8} key={d.key}>
            <Card
              hoverable
              style={{ background: d.color, border: "none" }}
              onClick={() => navigate(d.key)}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {d.icon}
                <Text strong style={{ fontSize: 16 }}>
                  {d.title}
                </Text>
                <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                  {d.desc}
                </Paragraph>
                <Space wrap>
                  {d.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
                <Button
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => navigate(d.key)}
                >
                  查看演示
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
