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

## 学习路线

### 阶段一：组件通信（已完成）

| Demo | 核心知识点 | 状态 |
|------|-----------|------|
| PropsDemo | props 父→子、回调子→父、useActionState (React 19) | ✅ |
| ContextDemo | createContext / useContext、Context 拆分优化、useCallback | ✅ |
| EventBusDemo | mitt 事件总线、兄弟组件通信 | ✅ |
| RefDemo | useRef 操作 DOM、forwardRef、useImperativeHandle | ✅|

### 阶段二：Hooks 深入（已完成）

| Demo | 核心知识点 | 状态 |
|------|-----------|------|
| FormDemo | 受控表单、自定义校验、useRef 获取焦点 | ✅ |
| EffectDemo | useEffect 副作用、清理函数、依赖数组、闭包陷阱、竞态处理 | ✅|
| — | useReducer 复杂状态、搭配 Context 替代 Redux | ✅ |
| — | 自定义 Hook 封装（useFetch / useLocalStorage 等） | ✅ |
| — | useTransition / useDeferredValue 并发渲染 | ✅ |

### 阶段三：性能优化（待完成）

| Demo | 核心知识点 | 状态 |
|------|-----------|------|
| — | React.memo + useMemo + useCallback 避免无效渲染 | ⬜ |
| — | 渲染次数可视化（为什么重渲染 / 如何止损） | ⬜ |
| — | lazy + Suspense 路由级代码分割 | ⬜ |
| — | 虚拟列表（react-virtual 处理万级数据） | ⬜ |

### 阶段四：路由进阶（待完成）

| Demo | 核心知识点 | 状态 |
|------|-----------|------|
| — | React Router v7 嵌套路由 / 动态路由 / 404 | ⬜ |
| — | loader / action 数据路由模式 | ⬜ |
| — | 路由守卫（鉴权跳转） | ⬜ |
| — | useNavigate / useSearchParams / useLocation | ⬜ |

### 阶段五：状态管理（部分完成）

| Demo | 核心知识点 | 状态 |
|------|-----------|------|
| ReduxDemo | createSlice、createAsyncThunk、useSelector、useDispatch | ⬜ |
| ZustandDemo | create、persist 中间件、selector 精确订阅 | ✅ |

### 阶段六：数据请求（待完成）

| Demo | 核心知识点 | 状态 |
|------|-----------|------|
| QueryDemo | useQuery 依赖查询、staleTime 缓存、手动 refetch | ⬜ |
| — | useMutation 增删改、乐观更新、invalidateQueries | ⬜ |
| — | useInfiniteQuery 无限滚动 | ⬜ |

### 阶段七：React 19 新特性（待完成）

| Demo | 核心知识点 | 状态 |
|------|-----------|------|
| SuspenseDemo | Suspense + use() 读取 Promise | ⬜ |
| PropsDemo | useActionState 表单 Action | ⬜ |
| — | useOptimistic 乐观 UI | ⬜ |
| — | React Compiler 自动 memo 原理 | ⬜ |

### 阶段八：工程化（待完成）

| Demo | 核心知识点 | 状态 |
|------|-----------|------|
| — | Error Boundary 错误边界 | ⬜ |
| — | Vitest + Testing Library 单元测试 | ⬜ |
| — | Vite 构建优化（分包、预构建） | ⬜ |

### 番外：React Fiber 原理（独立学习路线）

> 理解 React 内部运行机制，解释"为什么这样设计"的底层答案。

| 主题 | 核心知识点 | 状态 |
|------|-----------|------|
| Fiber 数据结构 | Fiber 节点结构、memoizedState hook 链表、child/sibling/return 指针 | ⬜ |
| 调和（Reconciliation） | 双缓冲 Fiber 树（current / workInProgress）、diff 算法、key 的作用 | ⬜ |
| 渲染两阶段 | render 阶段（可中断）vs commit 阶段（不可中断）、时间切片 | ⬜ |
| 优先级调度 | Lane 优先级模型、Scheduler、并发模式（Concurrent Mode） | ⬜ |
| Hooks 实现原理 | useState/useEffect 在 Fiber 上的存储方式、为什么不能在条件里用 Hook | ⬜ |

---

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
