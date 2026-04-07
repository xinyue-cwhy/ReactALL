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

// createAsyncThunk 异步 action
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getUsers()
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { selectUser, clearSelected } = userSlice.actions
export default userSlice.reducer
