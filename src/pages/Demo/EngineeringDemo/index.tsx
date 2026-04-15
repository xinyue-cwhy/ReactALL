import { ErrorBoundarySection } from './ErrorBoundarySection'
import { ViteBuildSection } from './ViteBuildSection'

const { Title, Paragraph } = Typography

const EngineeringDemo: React.FC = () => (
  <div>
    <Title level={3}>工程化</Title>
    <Paragraph>
      <Tag color="cyan">Error Boundary</Tag>
      <Tag color="cyan">Vitest</Tag>
      <Tag color="cyan">Vite 构建优化</Tag>
      生产级 React 工程必备：错误兜底、自动化测试、构建性能优化。
    </Paragraph>

    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card
        type="inner"
        title="一、Error Boundary — 错误边界"
        style={{ borderRadius: 8 }}
      >
        <ErrorBoundarySection />
      </Card>

      <Card
        type="inner"
        title="二、Vitest + Testing Library — 单元测试"
        style={{ borderRadius: 8 }}
      >
        <TestingSection />
      </Card>

      <Card
        type="inner"
        title="三、Vite 构建优化 — 分包 / 预构建 / 动态 import"
        style={{ borderRadius: 8 }}
      >
        <ViteBuildSection />
      </Card>
    </Space>
  </div>
)

// ── 测试说明区（内联，依赖安装后补充实际测试文件） ──────────────────────────

const TestingSection = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={16}>
    <Alert
      message="Vitest 复用 Vite 配置，无需额外 webpack/jest 配置，速度更快。Testing Library 倡导'从用户视角测试'。"
      type="info"
      showIcon
    />

    <Card size="small" title="vitest.config.ts（或在 vite.config.ts 中配置）">
      <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto' }}>
{`/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'jsdom',          // 模拟浏览器环境
    globals: true,                 // 无需 import describe/it/expect
    setupFiles: './src/test/setup.ts',
  }
})`}
      </pre>
    </Card>

    <Card size="small" title="src/test/setup.ts">
      <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto' }}>
{`import '@testing-library/jest-dom'
// 让 expect(el).toBeInTheDocument() 等 matcher 生效`}
      </pre>
    </Card>

    <Card size="small" title="测试示例：src/components/__tests__/Counter.test.tsx">
      <pre style={{ margin: 0, fontSize: 12, background: '#f6ffed', padding: 12, borderRadius: 6, overflow: 'auto' }}>
{`import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '../Counter'

describe('Counter', () => {
  it('初始值为 0', () => {
    render(<Counter />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('点击 +1 后计数增加', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: '+1' }))

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('点击重置后回到 0', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: '+1' }))
    await user.click(screen.getByRole('button', { name: '重置' }))

    expect(screen.getByText('0')).toBeInTheDocument()
  })
})`}
      </pre>
    </Card>

    <Alert
      message={
        <div>
          <div style={{ marginBottom: 8 }}>
            <Tag color="blue">核心 API</Tag>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><Tag>render()</Tag> 把组件挂到虚拟 DOM</li>
            <li><Tag>screen.getByRole/Text/Label</Tag> 像用户一样通过语义查找元素</li>
            <li><Tag>userEvent.click/type</Tag> 模拟真实用户交互（比 fireEvent 更贴近浏览器行为）</li>
            <li><Tag>expect().toBeInTheDocument()</Tag> jest-dom 提供的语义化断言</li>
          </ul>
        </div>
      }
      type="warning"
      showIcon={false}
    />

    <Alert
      message={
        <span>
          运行测试：<Tag color="green">npm run test</Tag>（配置后）。
          项目已安装 vitest + @testing-library/react，测试文件在{' '}
          <Tag>src/__tests__/</Tag>
        </span>
      }
      type="success"
      showIcon
    />
  </Space>
)

export default EngineeringDemo
