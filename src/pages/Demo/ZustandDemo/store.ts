import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============ 购物车 Store ============

// 购物车单项的数据结构
interface CartItem {
  id: number
  name: string
  price: number
  qty: number // 数量
}

// 整个 store 的类型：状态 + 方法
interface CartStore {
  items: CartItem[] // 购物车列表
  addItem: (item: Omit<CartItem, 'qty'>) => void // 加购（不需要传 qty，内部自动设为 1）
  removeItem: (id: number) => void // 删除某项
  updateQty: (id: number, qty: number) => void // 更新数量
  clearCart: () => void // 清空购物车
  total: () => number // 计算总价（方法，不是状态）
}

// ============ 精确订阅 Demo Store ============

interface SelectorStore {
  count: number
  name: string
  increment: () => void
  setName: (name: string) => void
}

export const useSelectorStore = create<SelectorStore>()(
  // (set) 是 Zustand 提供的更新函数
  (set) => ({
    // 初始状态
    count: 0,
    name: '张三',

    // 用函数形式拿最新值，避免闭包陷阱
    increment: () => set((s) => ({ count: s.count + 1 })),

    // 直接传对象，Zustand 内部做浅合并，不会覆盖 count
    setName: (name) => set({ name })
  })
)

// create<CartStore>() 创建一个 store，泛型指定类型
// persist 是中间件，把 state 自动同步到 localStorage
export const useCartStore = create<CartStore>()(
  persist(
    // set：更新状态    get：在方法里读最新状态
    (set, get) => ({
      items: [], // 初始购物车为空

      addItem: (item) =>
        set((state) => {
          // 检查购物车里是否已有这个商品
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            // 已有 → 数量 +1
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + 1 } : i
              )
            }
          }
          // 没有 → 新增一项，qty 初始为 1
          return { items: [...state.items, { ...item, qty: 1 }] }
        }),

      removeItem: (id) =>
        // 过滤掉对应 id 的项
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id) // 数量为 0 → 直接删除
              : state.items.map((i) => (i.id === id ? { ...i, qty } : i)) // 否则更新数量
        })),

      clearCart: () => set({ items: [] }), // 清空，直接覆盖 items

      // get() 拿最新 state，不能用闭包里的 state（那是初始值）
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0)
    }),
    {
      name: 'cart-storage' // localStorage 存储的 key 名
    }
  )
)
