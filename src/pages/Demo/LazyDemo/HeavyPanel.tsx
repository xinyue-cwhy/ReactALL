const { Text, Paragraph } = Typography

// 这是一个"体积较大"的面板组件
// 实际项目中，此类组件往往依赖 ECharts、Monaco Editor 等大型第三方库
const HeavyPanel: React.FC = () => (
  <Card
    size="small"
    style={{
      background: 'linear-gradient(135deg, #f0f5ff 0%, #f9f0ff 100%)',
      border: '1px solid #adc6ff',
      borderRadius: 8
    }}
  >
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space>
        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
        <Text strong style={{ fontSize: 15 }}>
          HeavyPanel 已加载！
        </Text>
      </Space>

      <Paragraph type="secondary" style={{ marginBottom: 8 }}>
        这是通过 <Text code>React.lazy</Text> 动态加载的独立 JS chunk。
        实际项目中，这里往往是体积较大的依赖——首屏不需要它们，按需加载可以显著减少初始包体积。
      </Paragraph>

      <Space wrap>
        {[
          'echarts (~1 MB)',
          'monaco-editor (~2 MB)',
          'react-pdf (~500 KB)',
          'leaflet (~140 KB)',
          'video.js (~650 KB)'
        ].map((tag) => (
          <Tag key={tag} color="purple">
            {tag}
          </Tag>
        ))}
      </Space>

      <Alert
        type="success"
        showIcon
        message={
          <Text style={{ fontSize: 12 }}>
            <Text strong>加载时间：</Text>
            {new Date().toLocaleTimeString()}
            <br />
            <Text strong>再次显示：</Text>
            从内存缓存读取，无需重新请求网络
          </Text>
        }
      />
    </Space>
  </Card>
)

export default HeavyPanel
