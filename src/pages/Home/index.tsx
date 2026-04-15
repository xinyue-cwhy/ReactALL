import { useNavigate } from 'react-router-dom'

const { Title, Paragraph, Text } = Typography

const categories = [
  {
    label: '组件通信',
    color: '#1677ff',
    icon: <SwapOutlined />,
    demos: [
      {
        key: '/demo/props',
        icon: <NodeIndexOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
        title: 'Props 父子通信',
        desc: '父组件通过 props 向子组件传递数据，子组件通过回调函数向父组件通信。',
        tags: ['props', 'callback', 'useState'],
        color: '#e6f4ff'
      },
      {
        key: '/demo/context',
        icon: <GlobalOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
        title: 'Context 跨层通信',
        desc: '使用 createContext + useContext 实现跨层级组件通信，拆分 Context 避免无效渲染。',
        tags: ['createContext', 'useContext', 'useCallback'],
        color: '#f6ffed'
      },
      {
        key: '/demo/ref',
        icon: <RetweetOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
        title: 'Ref 命令式通信',
        desc: '使用 useRef、forwardRef、useImperativeHandle 实现父调子方法。',
        tags: ['useRef', 'forwardRef', 'useImperativeHandle'],
        color: '#fff0f6'
      },
      {
        key: '/demo/eventbus',
        icon: <ApiOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
        title: 'EventBus 发布订阅',
        desc: '基于 mitt 实现事件总线，兄弟组件或任意组件间解耦通信。',
        tags: ['mitt', 'emit', 'on/off'],
        color: '#e6fffb'
      }
    ]
  },
  {
    label: 'Hooks 深入',
    color: '#d48806',
    icon: <BulbOutlined />,
    demos: [
      {
        key: '/demo/form',
        icon: <ToolOutlined style={{ fontSize: 32, color: '#2f54eb' }} />,
        title: '受控表单',
        desc: '使用 useState 管理表单数据，提交时统一校验，输入时实时清除错误提示。',
        tags: ['useState', '受控组件', '表单校验'],
        color: '#f0f5ff'
      },
      {
        key: '/demo/effect',
        icon: <BulbOutlined style={{ fontSize: 32, color: '#d48806' }} />,
        title: 'useEffect 副作用',
        desc: '掌握依赖数组、清理函数、闭包陷阱与竞态处理，用好 React 副作用。',
        tags: ['useEffect', '依赖数组', '清理函数'],
        color: '#fffbe6'
      },
      {
        key: '/demo/reducer',
        icon: <FunctionOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
        title: 'useReducer 复杂状态',
        desc: '用 useReducer 管理多字段复杂状态，搭配 Context 实现轻量级全局状态，替代 Redux。',
        tags: ['useReducer', 'Context', 'dispatch'],
        color: '#f9f0ff'
      },
      {
        key: '/demo/custom-hook',
        icon: <CodeOutlined style={{ fontSize: 32, color: '#096dd9' }} />,
        title: '自定义 Hook',
        desc: '封装 useFetch、useLocalStorage、useDebounce、useToggle 等通用 Hook，复用状态逻辑。',
        tags: ['useFetch', 'useLocalStorage', 'useDebounce'],
        color: '#e6f4ff'
      },
      {
        key: '/demo/concurrent',
        icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#cf1322' }} />,
        title: '并发渲染',
        desc: '用 useTransition 标记非紧急更新，用 useDeferredValue 滞后值，保持 UI 始终响应。',
        tags: ['useTransition', 'useDeferredValue', 'pending'],
        color: '#fff1f0'
      }
    ]
  },
  {
    label: '性能优化',
    color: '#389e0d',
    icon: <StarOutlined />,
    demos: [
      {
        key: '/demo/memo',
        icon: <StarOutlined style={{ fontSize: 32, color: '#389e0d' }} />,
        title: 'memo / useMemo / useCallback',
        desc: '用 React.memo 跳过子组件无效渲染，用 useCallback 稳定回调引用，用 useMemo 缓存昂贵计算。',
        tags: ['React.memo', 'useMemo', 'useCallback'],
        color: '#f6ffed'
      },
      {
        key: '/demo/render',
        icon: <ReloadOutlined style={{ fontSize: 32, color: '#389e0d' }} />,
        title: '渲染可视化',
        desc: '4 个重渲染根本原因逐一拆解：state 变化、props 引用陷阱、Context 变化、state 位置过高。',
        tags: ['重渲染', 'memo', 'Context 拆分'],
        color: '#f6ffed'
      },
      {
        key: '/demo/lazy',
        icon: <SplitCellsOutlined style={{ fontSize: 32, color: '#389e0d' }} />,
        title: 'lazy + Suspense 代码分割',
        desc: '用 React.lazy 将路由/组件打包成独立 chunk，按需加载减少首屏体积，Suspense 展示加载占位。',
        tags: ['React.lazy', 'Suspense', 'code splitting'],
        color: '#f6ffed'
      },
      {
        key: '/demo/virtual',
        icon: <UnorderedListOutlined style={{ fontSize: 32, color: '#389e0d' }} />,
        title: '虚拟列表',
        desc: '只渲染可见区域内的行，DOM 节点数始终保持极少量，轻松处理万级数据不卡顿。',
        tags: ['useVirtualizer', 'overscan', '按需渲染'],
        color: '#f6ffed'
      }
    ]
  },
  {
    label: '路由进阶',
    color: '#1677ff',
    icon: <BranchesOutlined />,
    demos: [
      {
        key: '/demo/loader',
        icon: <CloudDownloadOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
        title: 'loader / action',
        desc: '路由级数据加载（loader）和表单提交（action），组件渲染时数据已就绪，无需管理 loading 状态。',
        tags: ['loader', 'action', 'useLoaderData', 'Form'],
        color: '#e6f4ff'
      },
      {
        key: '/demo/router/users',
        icon: <BranchesOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
        title: '嵌套 / 动态路由',
        desc: '嵌套路由（Outlet）、动态路由（:id）、useNavigate、useSearchParams、useLocation、useParams。',
        tags: ['Outlet', 'useParams', 'useSearchParams', 'useNavigate'],
        color: '#e6f4ff'
      }
    ]
  },
  {
    label: '状态管理',
    color: '#722ed1',
    icon: <ThunderboltOutlined />,
    demos: [
      {
        key: '/demo/redux',
        icon: (
          <ThunderboltOutlined style={{ fontSize: 32, color: '#722ed1' }} />
        ),
        title: 'Redux 全局状态',
        desc: 'Redux Toolkit：createSlice、createAsyncThunk、useSelector、useDispatch。',
        tags: ['Redux Toolkit', 'createSlice', 'createAsyncThunk'],
        color: '#f9f0ff'
      },
      {
        key: '/demo/zustand',
        icon: <ShareAltOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
        title: 'Zustand 状态管理',
        desc: '轻量级状态管理，无 Provider 包裹，API 简洁，适合中小项目。',
        tags: ['zustand', 'create', 'immer'],
        color: '#fff7e6'
      }
    ]
  },
  {
    label: '数据请求',
    color: '#f5222d',
    icon: <DatabaseOutlined />,
    demos: [
      {
        key: '/demo/query',
        icon: <DatabaseOutlined style={{ fontSize: 32, color: '#f5222d' }} />,
        title: 'React Query + Axios',
        desc: '使用 TanStack Query 管理服务端状态，配合 Axios 拦截器处理请求。',
        tags: ['useQuery', 'useMutation', 'axios'],
        color: '#fff1f0'
      }
    ]
  },
  {
    label: '复杂表单',
    color: '#c41d7f',
    icon: <ToolOutlined />,
    demos: [
      {
        key: '/demo/booking-form',
        icon: <ToolOutlined style={{ fontSize: 32, color: '#c41d7f' }} />,
        title: '酒店预订单',
        desc: '多房间动态增删、房型→房间级联、日期联动计算房晚、增值服务叠加计价、支付方式条件校验、服务端房态冲突校验。',
        tags: ['动态增删行', '级联选择', '条件校验', '冲突校验'],
        color: '#fff0f6'
      }
    ]
  },
  {
    label: '工程化',
    color: '#08979c',
    icon: <ToolOutlined />,
    demos: [
      {
        key: '/demo/engineering',
        icon: <ToolOutlined style={{ fontSize: 32, color: '#08979c' }} />,
        title: '工程化',
        desc: 'Error Boundary 错误边界、Vitest + Testing Library 单元测试、Vite 构建优化（分包、预构建）。',
        tags: ['ErrorBoundary', 'Vitest', 'manualChunks'],
        color: '#e6fffb'
      }
    ]
  },
  {
    label: 'React 19 新特性',
    color: '#fa541c',
    icon: <ReloadOutlined />,
    demos: [
      {
        key: '/demo/suspense',
        icon: <ReloadOutlined style={{ fontSize: 32, color: '#fa541c' }} />,
        title: 'React Suspense',
        desc: 'React 19 Suspense 组件，配合 lazy 和 use() 实现组件级别的加载状态。',
        tags: ['Suspense', 'lazy', 'use()'],
        color: '#fff2e8'
      }
    ]
  }
]

const Home: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <Title level={2}>React 全家桶演示项目</Title>
      <Paragraph>
        本项目使用 <Text code>React 18</Text> + <Text code>Vite</Text> +{' '}
        <Text code>TypeScript</Text> 搭建， 涵盖 React
        全家桶核心技术栈，演示所有组件通信方式。
      </Paragraph>

      <Divider>技术栈</Divider>
      <Space wrap style={{ marginBottom: 24 }}>
        {[
          'React 18',
          'Vite 5',
          'TypeScript',
          'React Router v6',
          'Redux Toolkit',
          'Zustand',
          'TanStack Query',
          'Axios',
          'Ant Design 5',
          'mitt'
        ].map((t) => (
          <Tag color="blue" key={t}>
            {t}
          </Tag>
        ))}
      </Space>

      {categories.map((cat) => (
        <div key={cat.label} style={{ marginTop: 32 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
              paddingLeft: 14,
              borderLeft: `4px solid ${cat.color}`,
              background: `${cat.color}18`,
              borderRadius: '0 6px 6px 0',
              padding: '8px 14px'
            }}
          >
            <span style={{ color: cat.color, fontSize: 18 }}>{cat.icon}</span>
            <Text strong style={{ fontSize: 16, color: cat.color }}>
              {cat.label}
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            {cat.demos.map((d) => (
              <Col xs={24} sm={12} lg={8} key={d.key}>
                <Card
                  hoverable
                  style={{
                    background: `${cat.color}0f`,
                    border: `1px solid ${cat.color}30`
                  }}
                  onClick={() => navigate(d.key)}
                >
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    {d.icon}
                    <Text strong style={{ fontSize: 16 }}>
                      {d.title}
                    </Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
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
                      style={{ alignSelf: 'flex-start' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(d.key)
                      }}
                    >
                      查看演示
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  )
}

export default Home
