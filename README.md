# React 全家桶

基于 React 19 + TypeScript + Vite 的全家桶学习项目，包含 Redux、Zustand、React Query、React Router 等主流生态。

## 技术栈

- **框架**：React 19 + TypeScript
- **构建**：Vite
- **路由**：React Router v7
- **全局状态**：Redux Toolkit / Zustand
- **服务端状态**：TanStack React Query + Axios
- **UI**：Ant Design v6

## 代码规范

### ESLint（v9 Flat Config）

配置文件：`eslint.config.js`

| 规则 | 说明 |
|------|------|
| `react-hooks/rules-of-hooks` | error — Hook 不能在条件/循环中调用 |
| `react-hooks/exhaustive-deps` | warn — useEffect 依赖数组必须完整 |
| `react/react-in-jsx-scope` | off — React 19 无需手动引入 |
| `@typescript-eslint/no-unused-vars` | warn — 未使用变量（`_` 前缀忽略）|
| `@typescript-eslint/no-explicit-any` | warn — 避免使用 any |

### Prettier

配置文件：`.prettierrc`

| 选项 | 值 | 说明 |
|------|----|------|
| `semi` | false | 不加分号 |
| `singleQuote` | true | 使用单引号 |
| `trailingComma` | none | 不加尾逗号 |

### VSCode 配置

项目内置 `.vscode/settings.json`，打开项目即生效：

- 保存时自动修复 ESLint 错误
- 支持 ESLint v9 Flat Config
- 实时校验 `.ts` / `.tsx` 文件

推荐安装扩展：
- **ESLint**（`dbaeumer.vscode-eslint`）≥ 3.0
- **Prettier**（`esbenp.prettier-vscode`）
- **Error Lens**（`usernamehw.errorlens`）— 行内显示错误信息

## 开发

```bash
npm install
npm run dev
```

## 脚本

```bash
npm run lint        # 检查代码规范
npm run lint:fix    # 自动修复可修复的问题
npm run build       # 构建生产包
```
