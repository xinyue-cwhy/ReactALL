import type { ActionFunctionArgs } from 'react-router-dom'
import { redirect } from 'react-router-dom'

export interface Note {
  id: number
  content: string
  done: boolean
}

// 模拟内存数据库（实际项目中这里是 API 调用）
let notes: Note[] = [
  { id: 1, content: 'loader 在路由渲染前运行，组件始终能拿到数据', done: true },
  { id: 2, content: 'useLoaderData() 读取 loader 的返回值', done: false },
  { id: 3, content: 'Form 提交触发 action，action 处理写操作', done: false }
]

// ============ loader：路由级数据加载 ============
// 路由导航开始时运行，resolve 后才渲染组件，组件里永远有数据（不用 loading 状态）

export async function loader() {
  // 模拟网络延迟（实际项目中是 fetch / axios 调用）
  await new Promise((r) => setTimeout(r, 300))
  return { notes: [...notes] }
}

// ============ action：处理表单提交（写操作）============
// <Form method="post"> 提交后自动调用，处理完后 redirect 触发 loader 重新获取数据

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent') as string

  if (intent === 'add') {
    const content = (formData.get('content') as string)?.trim()
    if (!content) {
      // 返回验证错误（不 redirect），useActionData() 读取
      return { error: '笔记内容不能为空' }
    }
    notes = [...notes, { id: Date.now(), content, done: false }]
    return redirect('/demo/loader')
  }

  if (intent === 'toggle') {
    const id = Number(formData.get('id'))
    notes = notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n))
    return redirect('/demo/loader')
  }

  if (intent === 'delete') {
    const id = Number(formData.get('id'))
    notes = notes.filter((n) => n.id !== id)
    return redirect('/demo/loader')
  }

  return null
}
