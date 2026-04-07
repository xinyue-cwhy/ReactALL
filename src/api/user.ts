import request from './index'
import type { User, Post, Todo } from '../types'

export const getUsers = (): Promise<User[]> => request.get('/users')

export const getUserById = (id: number): Promise<User> =>
  request.get(`/users/${id}`)

export const getPosts = (): Promise<Post[]> => request.get('/posts')

export const getPostsByUser = (userId: number): Promise<Post[]> =>
  request.get(`/posts?userId=${userId}`)

export const getTodos = (): Promise<Todo[]> => request.get('/todos?_limit=10')
