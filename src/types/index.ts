export interface User {
  id: number
  name: string
  email: string
  phone?: string
  website?: string
}

export interface Post {
  id: number
  userId: number
  title: string
  body: string
}

export interface Todo {
  id: number
  userId: number
  title: string
  completed: boolean
}
