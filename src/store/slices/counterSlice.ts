import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += state.step
      state.history.push(state.value)
    },
    decrement: (state) => {
      state.value -= state.step
      state.history.push(state.value)
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
      state.history.push(state.value)
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

export const { increment, decrement, incrementByAmount, reset, setStep } =
  counterSlice.actions
export default counterSlice.reducer
