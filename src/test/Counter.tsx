import { useState } from 'react'

// 被测试的组件：简单计数器
// 放在 src/test/ 下仅供测试演示使用
export const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  )
}
