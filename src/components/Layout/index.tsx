import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { theme } from "antd";
import { useTheme } from "../../context/ThemeContext";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: "首页",
  },
  {
    key: "demo",
    icon: <SwapOutlined />,
    label: "通信方式演示",
    children: [
      {
        key: "/demo/props",
        icon: <NodeIndexOutlined />,
        label: "Props 父子通信",
      },
      {
        key: "/demo/context",
        icon: <GlobalOutlined />,
        label: "Context 跨层通信",
      },
      {
        key: "/demo/redux",
        icon: <ThunderboltOutlined />,
        label: "Redux 全局状态",
      },
      {
        key: "/demo/zustand",
        icon: <ShareAltOutlined />,
        label: "Zustand 状态管理",
      },
      { key: "/demo/ref", icon: <RetweetOutlined />, label: "Ref 命令式通信" },
      {
        key: "/demo/eventbus",
        icon: <ApiOutlined />,
        label: "EventBus 发布订阅",
      },
      {
        key: "/demo/query",
        icon: <FunctionOutlined />,
        label: "React Query + Axios",
      },
      {
        key: "/demo/suspense",
        icon: <FunctionOutlined />,
        label: "React Suspense",
      },
    ],
  },
];

const breadcrumbMap: Record<string, string> = {
  "/": "首页",
  "/demo/props": "Props 父子通信",
  "/demo/context": "Context 跨层通信",
  "/demo/redux": "Redux 全局状态",
  "/demo/zustand": "Zustand 状态管理",
  "/demo/ref": "Ref 命令式通信",
  "/demo/eventbus": "EventBus 发布订阅",
  "/demo/query": "React Query + Axios",
  "/demo/suspense": "React Suspense",
};

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme: appTheme } = useTheme();
  const { token } = theme.useToken();

  const isDark = appTheme === "dark";
  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = [
    { title: "首页" },
    ...segments.map((_, i) => ({
      title:
        breadcrumbMap["/" + segments.slice(0, i + 1).join("/")] || segments[i],
    })),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={isDark ? "dark" : "light"}
        style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.06)" }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: token.colorPrimary,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: collapsed ? 12 : 16,
            }}
          >
            {collapsed ? "RF" : "React 全家桶"}
          </Text>
        </div>
        <Menu
          theme={isDark ? "dark" : "light"}
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["demo"]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Breadcrumb items={breadcrumbs} />
          <Space>
            <Badge dot>
              <Avatar
                icon={<UserOutlined />}
                style={{ background: token.colorPrimary }}
              />
            </Badge>
            <Text strong>React 全家桶 Demo</Text>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            minHeight: 360,
          }}
        >
          <Outlet />
        </Content>

        <Footer
          style={{ textAlign: "center", color: token.colorTextSecondary }}
        >
          React + Vite + TypeScript 全家桶演示 &copy; {new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
