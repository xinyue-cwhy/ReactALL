import type { FC } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/Layout'
import {
  loader as loaderDemoLoader,
  action as loaderDemoAction
} from '../pages/Demo/LoaderDemo/loaderAction'
import { requireAuthLoader } from '../pages/Demo/RouterDemo/GuardDemo/authStore'

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
const RenderDemo = lazy(() => import('../pages/Demo/RenderDemo'))
const LazyDemo = lazy(() => import('../pages/Demo/LazyDemo'))
const VirtualDemo = lazy(() => import('../pages/Demo/VirtualDemo'))
const LoaderDemo = lazy(() => import('../pages/Demo/LoaderDemo'))
const RouterDemo = lazy(() => import('../pages/Demo/RouterDemo'))
const RouterUserList = lazy(() => import('../pages/Demo/RouterDemo/UserList'))
const RouterUserDetail = lazy(
  () => import('../pages/Demo/RouterDemo/UserDetail')
)
const RouterSettings = lazy(
  () => import('../pages/Demo/RouterDemo/SettingsPanel')
)
const RouterGuardDemo = lazy(() => import('../pages/Demo/RouterDemo/GuardDemo'))
const RouterLoginPage = lazy(
  () => import('../pages/Demo/RouterDemo/GuardDemo/LoginPage')
)
const RouterProtectedPage = lazy(
  () => import('../pages/Demo/RouterDemo/GuardDemo/ProtectedPage')
)
const BookingFormDemo = lazy(() => import('../pages/Demo/BookingFormDemo'))
const EngineeringDemo = lazy(() => import('../pages/Demo/EngineeringDemo'))
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
      { path: 'demo/render', element: withSuspense(RenderDemo) },
      { path: 'demo/lazy', element: withSuspense(LazyDemo) },
      { path: 'demo/virtual', element: withSuspense(VirtualDemo) },
      {
        path: 'demo/loader',
        element: withSuspense(LoaderDemo),
        loader: loaderDemoLoader,
        action: loaderDemoAction
      },
      {
        path: 'demo/router',
        element: withSuspense(RouterDemo),
        children: [
          {
            index: true,
            element: <Navigate to="/demo/router/users" replace />
          },
          { path: 'users', element: withSuspense(RouterUserList) },
          { path: 'users/:id', element: withSuspense(RouterUserDetail) },
          { path: 'settings', element: withSuspense(RouterSettings) },
          { path: 'guard', element: withSuspense(RouterGuardDemo) },
          { path: 'login', element: withSuspense(RouterLoginPage) },
          {
            path: 'protected',
            loader: requireAuthLoader,
            element: withSuspense(RouterProtectedPage)
          }
        ]
      },
      { path: 'demo/booking-form', element: withSuspense(BookingFormDemo) },
      { path: 'demo/engineering', element: withSuspense(EngineeringDemo) },
      { path: '404', element: withSuspense(NotFound) },
      { path: '*', element: <Navigate to="/404" replace /> }
    ]
  }
])

export default router
