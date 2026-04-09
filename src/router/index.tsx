import type { FC } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/Layout'

const Loading = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 200
    }}
  >
    <Spin size="large" />
  </div>
)

// 路由懒加载
const Home = lazy(() => import('../pages/Home'))
const PropsDemo = lazy(() => import('../pages/Demo/PropsDemo'))
const ContextDemo = lazy(() => import('../pages/Demo/ContextDemo'))
const ReduxDemo = lazy(() => import('../pages/Demo/ReduxDemo'))
const ZustandDemo = lazy(() => import('../pages/Demo/ZustandDemo'))
const RefDemo = lazy(() => import('../pages/Demo/RefDemo'))
const EventBusDemo = lazy(() => import('../pages/Demo/EventBusDemo'))
const QueryDemo = lazy(() => import('../pages/Demo/QueryDemo'))
const SuspenseDemo = lazy(() => import('../pages/Demo/SuspenseDemo'))
const FormDemo = lazy(() => import('../pages/Demo/FormDemo'))
const EffectDemo = lazy(() => import('../pages/Demo/EffectDemo'))
const ReducerDemo = lazy(() => import('../pages/Demo/ReducerDemo'))
const CustomHookDemo = lazy(() => import('../pages/Demo/CustomHookDemo'))
const ConcurrentDemo = lazy(() => import('../pages/Demo/ConcurrentDemo'))
const MemoDemo = lazy(() => import('../pages/Demo/MemoDemo'))
const NotFound = lazy(() => import('../pages/NotFound'))

const withSuspense = (Component: FC) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(Home) },
      { path: 'demo/props', element: withSuspense(PropsDemo) },
      { path: 'demo/context', element: withSuspense(ContextDemo) },
      { path: 'demo/redux', element: withSuspense(ReduxDemo) },
      { path: 'demo/zustand', element: withSuspense(ZustandDemo) },
      { path: 'demo/ref', element: withSuspense(RefDemo) },
      { path: 'demo/eventbus', element: withSuspense(EventBusDemo) },
      { path: 'demo/query', element: withSuspense(QueryDemo) },
      { path: 'demo/suspense', element: withSuspense(SuspenseDemo) },
      { path: 'demo/form', element: withSuspense(FormDemo) },
      { path: 'demo/effect', element: withSuspense(EffectDemo) },
      { path: 'demo/reducer', element: withSuspense(ReducerDemo) },
      { path: 'demo/custom-hook', element: withSuspense(CustomHookDemo) },
      { path: 'demo/concurrent', element: withSuspense(ConcurrentDemo) },
      { path: 'demo/memo', element: withSuspense(MemoDemo) },
      { path: '404', element: withSuspense(NotFound) },
      { path: '*', element: <Navigate to="/404" replace /> }
    ]
  }
])

export default router
