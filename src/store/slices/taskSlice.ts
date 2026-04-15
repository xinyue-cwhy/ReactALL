// createEntityAdapter：管理实体集合（以 id 为 key）的标准化 state 结构 + CRUD 操作
// 生成的 state：{ ids: EntityId[], entities: Record<EntityId, T> }
// 相比 list: T[]，按 id 查找是 O(1) 而不是 O(n)，适合频繁按 id 访问的场景
import { createSlice, createEntityAdapter, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

export interface Task {
  id: string
  title: string
  completed: boolean
}

const tasksAdapter = createEntityAdapter<Task>()
// 可传入 sortComparer 保持有序：
// createEntityAdapter({ sortComparer: (a, b) => a.title.localeCompare(b.title) })

export const taskSlice = createSlice({
  name: 'tasks',
  initialState: tasksAdapter.getInitialState(), // { ids: [], entities: {} }
  reducers: {
    // prepare callback：action creator 被调用时先执行 prepare，再把 payload 传给 reducer
    // 常见用途：生成 id、添加时间戳、标准化外部输入
    // dispatch(addTask('买菜')) → prepare('买菜') → { payload: { id: '...', title: '买菜', ... } }
    addTask: {
      prepare: (title: string) => ({
        payload: { id: crypto.randomUUID(), title, completed: false } satisfies Task
      }),
      reducer: tasksAdapter.addOne // adapter 提供的 CRUD 方法可直接当 reducer 使用
    },

    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.entities[action.payload]
      if (task) task.completed = !task.completed // Immer 允许直接 mutation
    },

    removeTask: tasksAdapter.removeOne, // removeOne(state, action: PayloadAction<EntityId>)

    clearCompleted: (state) => {
      const completedIds = state.ids.filter((id) => state.entities[id]?.completed)
      tasksAdapter.removeMany(state, completedIds)
    }
  }
})

export const { addTask, toggleTask, removeTask, clearCompleted } = taskSlice.actions

// getSelectors(stateSelector)：生成绑定到全局 state 的选择器
// selectAll   → Task[]（按 ids 顺序）
// selectTotal → number
export const { selectAll: selectAllTasks, selectTotal: selectTaskCount } =
  tasksAdapter.getSelectors<RootState>((state) => state.tasks)

export default taskSlice.reducer
