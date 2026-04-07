import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'

const antdComponents = [
  'Button',
  'Input',
  'Select',
  'Form',
  'Table',
  'Card',
  'Modal',
  'Drawer',
  'Tabs',
  'Tag',
  'Badge',
  'Alert',
  'Space',
  'Row',
  'Col',
  'Typography',
  'Divider',
  'List',
  'Avatar',
  'Image',
  'Upload',
  'Spin',
  'Skeleton',
  'Result',
  'Empty',
  'Pagination',
  'Tooltip',
  'Popover',
  'Dropdown',
  'Menu',
  'Breadcrumb',
  'Steps',
  'Switch',
  'Radio',
  'Checkbox',
  'DatePicker',
  'TimePicker',
  'Slider',
  'InputNumber',
  'Rate',
  'Layout',
  'Affix',
  'Statistic',
  'Timeline',
  'Tree',
  'Collapse',
  'Carousel',
  'Descriptions',
  'Popconfirm',
  'Progress',
  'App',
  'ConfigProvider',
  'AutoComplete',
  'Cascader',
  'Result'
]

export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      // 自动引入 React hooks 和 react-router-dom
      imports: ['react', 'react-router-dom'],
      dts: 'src/auto-imports.d.ts',
      // 关闭 eslint 检查（避免 no-undef 报错）
      eslintrc: { enabled: true },
      resolvers: [
        // antd 组件自动引入
        (name: string) => {
          if (antdComponents.includes(name)) {
            return { name, from: 'antd' }
          }
        },
        // antd icons 自动引入（Outlined / Filled / TwoTone）
        (name: string) => {
          if (
            name.endsWith('Outlined') ||
            name.endsWith('Filled') ||
            name.endsWith('TwoTone')
          ) {
            return { name, from: '@ant-design/icons' }
          }
        }
      ]
    })
  ]
})
