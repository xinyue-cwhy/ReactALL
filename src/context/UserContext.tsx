import React, { createContext, useContext, useReducer } from 'react'
import type { User } from '../types'

interface UserState {
  currentUser: User | null
  isLoggedIn: boolean
}

type UserAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }

const initialState: UserState = {
  currentUser: null,
  isLoggedIn: false,
}

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'LOGIN':
      return { currentUser: action.payload, isLoggedIn: true }
    case 'LOGOUT':
      return { currentUser: null, isLoggedIn: false }
    default:
      return state
  }
}

interface UserContextType extends UserState {
  login: (user: User) => void
  logout: () => void
}

const UserContext = createContext<UserContextType>({
  ...initialState,
  login: () => {},
  logout: () => {},
})

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState)

  const login = (user: User) => dispatch({ type: 'LOGIN', payload: user })
  const logout = () => dispatch({ type: 'LOGOUT' })

  return (
    <UserContext.Provider value={{ ...state, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

export default UserContext
