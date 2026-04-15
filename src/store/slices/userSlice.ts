// createAsyncThunk：处理异步操作的标准方式
// 接收两个参数：
//   1. action type 前缀（字符串）
//   2. payloadCreator（async 函数）
// 自动派发三个 action：pending / fulfilled / rejected
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction
} from '@reduxjs/toolkit'
import type { User } from '../../types'
import { getUsers } from '../../api/user'

interface UserSliceState {
  list: User[]
  selected: User | null
  loading: boolean
  error: string | null
}

const initialState: UserSliceState = {
  list: [],
  selected: null,
  loading: false,
  error: null
}

// createAsyncThunk('prefix/name', async (arg, thunkAPI) => {...})
// thunkAPI 提供：dispatch、getState、rejectWithValue、signal……
// rejectWithValue(value)：让 rejected action 携带自定义 payload
//   而不是默认的 Error 对象（方便在 UI 里直接显示错误文本）
export const fetchUsers = createAsyncThunk(
  'users/fetchAll', // → dispatch 后产出 'users/fetchAll/pending' 等 action
  async (_, { rejectWithValue }) => {
    try {
      return await getUsers() // 成功 → fulfilled，payload = 返回值
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message) // 失败 → rejected，payload = 错误文本
    }
  }
)

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<User>) => {
      state.selected = action.payload
    },
    clearSelected: (state) => {
      state.selected = null
    }
  },

  // extraReducers：处理"外部" action（如 createAsyncThunk 产生的三个 action）
  // builder 模式提供完整的 TypeScript 类型推断
  extraReducers: (builder) => {
    builder
      // Promise 进行中：标记 loading，清除旧错误
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Promise 成功：把数据写入 list
      // action.payload 类型 = payloadCreator 的返回值类型（User[]）
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      // Promise 失败：记录错误文本（来自 rejectWithValue）
      // action.payload 类型 = rejectWithValue 的参数类型
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { selectUser, clearSelected } = userSlice.actions
export default userSlice.reducer
