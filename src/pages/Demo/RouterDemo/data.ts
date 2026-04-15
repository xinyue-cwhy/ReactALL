export interface User {
  id: number
  name: string
  role: string
  level: string
  email: string
  joined: string
  status: 'active' | 'inactive'
}

export const USERS: User[] = [
  {
    id: 1,
    name: '张三',
    role: '前端',
    level: 'P5',
    email: 'zhangsan@example.com',
    joined: '2021-03-15',
    status: 'active'
  },
  {
    id: 2,
    name: '李四',
    role: '后端',
    level: 'P6',
    email: 'lisi@example.com',
    joined: '2020-07-01',
    status: 'active'
  },
  {
    id: 3,
    name: '王五',
    role: '全栈',
    level: 'P7',
    email: 'wangwu@example.com',
    joined: '2019-11-20',
    status: 'active'
  },
  {
    id: 4,
    name: '赵六',
    role: '算法',
    level: 'P6',
    email: 'zhaoliu@example.com',
    joined: '2022-01-08',
    status: 'inactive'
  },
  {
    id: 5,
    name: '陈七',
    role: '前端',
    level: 'P4',
    email: 'chenqi@example.com',
    joined: '2023-04-10',
    status: 'active'
  },
  {
    id: 6,
    name: '刘八',
    role: '后端',
    level: 'P5',
    email: 'liuba@example.com',
    joined: '2022-09-05',
    status: 'active'
  },
  {
    id: 7,
    name: '周九',
    role: '全栈',
    level: 'P5',
    email: 'zhoujiu@example.com',
    joined: '2021-06-30',
    status: 'inactive'
  },
  {
    id: 8,
    name: '吴十',
    role: '前端',
    level: 'P6',
    email: 'wushi@example.com',
    joined: '2020-12-15',
    status: 'active'
  },
  {
    id: 9,
    name: '郑十一',
    role: '算法',
    level: 'P7',
    email: 'zhengsh@example.com',
    joined: '2018-08-01',
    status: 'active'
  },
  {
    id: 10,
    name: '王十二',
    role: '后端',
    level: 'P4',
    email: 'wangsh@example.com',
    joined: '2023-07-20',
    status: 'active'
  },
  {
    id: 11,
    name: '冯十三',
    role: '前端',
    level: 'P5',
    email: 'fengsh@example.com',
    joined: '2022-03-11',
    status: 'inactive'
  },
  {
    id: 12,
    name: '陈十四',
    role: '全栈',
    level: 'P6',
    email: 'chenshsi@example.com',
    joined: '2021-10-09',
    status: 'active'
  }
]
