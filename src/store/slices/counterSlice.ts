// createSlice：Redux Toolkit 的核心 API
// 把 action type 字符串、action creator、reducer 三者合并到一个对象里
// 底层用 Immer —— 可以写"看起来是 mutation"的代码，实际产出不可变的新 state
import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

interface CounterState {
  value: number
  step: number
  history: number[]
}

const initialState: CounterState = {
  value: 0,
  step: 1,
  history: [0]
}

// 历史记录上限，防止无限增长
const MAX_HISTORY = 10
const pushHistory = (history: number[], value: number) => {
  history.push(value)
  if (history.length > MAX_HISTORY) history.shift()
}

export const counterSlice = createSlice({
  name: 'counter', // action type 前缀：'counter/increment'、'counter/reset'……

  initialState,

  // reducers 里的每个函数 → 自动生成对应的 action creator
  // 参数 state 是 Immer 代理，可以直接 push / 赋值，框架负责产出新对象
  reducers: {
    increment: (state) => {
      state.value += state.step
      pushHistory(state.history, state.value)
    },
    decrement: (state) => {
      state.value -= state.step
      pushHistory(state.history, state.value)
    },

    // PayloadAction<T>：明确 action.payload 的类型
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
      pushHistory(state.history, state.value)
    },

    reset: (state) => {
      state.value = 0
      state.history = [0]
    },

    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload
    }
  }
})

// createSlice 自动把 reducers 里的函数导出为 action creator
// dispatch(increment()) → { type: 'counter/increment' }
export const { increment, decrement, incrementByAmount, reset, setStep } =
  counterSlice.actions

export default counterSlice.reducer

// ─── createSelector：记忆化选择器 ──────────────────────────────────────
// 原理：只有"输入选择器"的返回值变化时，才重新计算结果
// 相同输入 → 直接返回上次缓存，避免每次 render 都重新计算派生数据
export const selectCounterStats = createSelector(
  // 输入选择器（可以多个）
  (state: RootState) => state.counter.value,
  // 结果函数：仅在 value 变化时执行
  (value) => ({
    isEven: value % 2 === 0,
    isPositive: value > 0,
    squared: value * value,
    abs: Math.abs(value)
  })
)
