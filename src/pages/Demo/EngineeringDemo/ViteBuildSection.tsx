const { Text } = Typography

export const ViteBuildSection = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={16}>
    {/* 分包 */}
    <Card title="场景一：手动分包（manualChunks）" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="默认 Vite 把所有依赖打进一个 vendor chunk，手动分包可以让浏览器并行下载、提高缓存命中率"
          type="info"
          showIcon
        />
        <Card size="small" title="vite.config.ts">
          <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto' }}>
{`build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // React 相关打一个包（更新频率低，缓存稳定）
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        // UI 库单独一包（体积大，独立缓存）
        'vendor-antd': ['antd', '@ant-design/icons'],
        // 状态/请求库
        'vendor-store': ['@reduxjs/toolkit', 'react-redux', 'zustand'],
        'vendor-query': ['@tanstack/react-query', 'axios'],
      }
    }
  }
}`}
          </pre>
        </Card>
        <Alert
          message={
            <div>
              <Text strong>分包原则：</Text>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                <li>更新频率相近的包放一起（React 核心极少更新，业务代码频繁更新）</li>
                <li>体积大的库单独分包（antd ~1MB+），避免一个包过大影响并行下载</li>
                <li>分包太多反而增加 HTTP 请求数，一般 3~5 个 vendor chunk 合适</li>
              </ul>
            </div>
          }
          type="warning"
          showIcon={false}
        />
      </Space>
    </Card>

    {/* 预构建 */}
    <Card title="场景二：预构建（optimizeDeps）" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Vite 开发环境用 esbuild 把 CommonJS 依赖预转换成 ESM，缓存到 node_modules/.vite，避免每次请求重新转换"
          type="info"
          showIcon
        />
        <Card size="small" title="vite.config.ts">
          <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto' }}>
{`optimizeDeps: {
  // 强制预构建某些包（Vite 自动检测不到动态引入的依赖时手动加）
  include: ['antd/es/locale/zh_CN', 'lodash-es'],
  // 排除不需要预构建的包（纯 ESM 且无需转换）
  exclude: ['some-pure-esm-package'],
}`}
          </pre>
        </Card>
        <Alert
          message={
            <div>
              <Text strong>什么时候需要手动配置：</Text>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                <li>动态 import 的依赖（Vite 静态分析发现不了）</li>
                <li>按需引入的 locale、主题等子路径</li>
                <li>首次启动很慢时，可以 include 常用依赖提前预构建</li>
              </ul>
            </div>
          }
          type="warning"
          showIcon={false}
        />
      </Space>
    </Card>

    {/* 动态 import */}
    <Card title="场景三：动态 import（已在 LazyDemo 中实践）" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small" title="路由级代码分割（router/index.tsx 中已使用）">
          <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto' }}>
{`// 每个 lazy() 调用对应一个独立 chunk
// 用户访问该路由时才下载对应 JS
const QueryDemo = lazy(() => import('../pages/Demo/QueryDemo'))
const ReduxDemo = lazy(() => import('../pages/Demo/ReduxDemo'))

// 构建产物：
// dist/assets/QueryDemo-[hash].js   （仅访问 /demo/query 时加载）
// dist/assets/ReduxDemo-[hash].js   （仅访问 /demo/redux 时加载）`}
          </pre>
        </Card>
        <Alert
          message={
            <div>
              <Text strong>加载策略对比：</Text>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                <li><Text code>lazy()</Text>：用户点进该路由才下载，首屏最快，首次访问有短暂延迟</li>
                <li>预加载：<Text code>{'<link rel="modulepreload">'}</Text> 或 Vite 的 <Text code>vitePreload</Text>，提前下载但不执行</li>
                <li>预取：<Text code>{'import(/* @vite-ignore */ url)'}</Text> 在空闲时提前缓存</li>
              </ul>
            </div>
          }
          type="warning"
          showIcon={false}
        />
      </Space>
    </Card>
  </Space>
)
