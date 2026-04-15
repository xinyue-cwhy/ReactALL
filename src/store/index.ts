import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import userReducer from './slices/userSlice'
import taskReducer from './slices/taskSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    users: userReducer,
    tasks: taskReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
