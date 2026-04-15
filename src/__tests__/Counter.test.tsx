import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '../test/Counter'

// describe 分组，it/test 是单个用例
describe('Counter 组件', () => {
  it('初始值为 0', () => {
    render(<Counter />)
    // getByTestId：通过 data-testid 属性查找元素
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('点击 +1 后计数增加', async () => {
    // userEvent.setup() 模拟真实用户行为（含事件冒泡、焦点等）
    const user = userEvent.setup()
    render(<Counter />)

    // getByRole：通过 ARIA role 查找，更贴近用户视角
    await user.click(screen.getByRole('button', { name: '+1' }))

    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('连续点击三次计数为 3', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const btn = screen.getByRole('button', { name: '+1' })
    await user.click(btn)
    await user.click(btn)
    await user.click(btn)

    expect(screen.getByTestId('count')).toHaveTextContent('3')
  })

  it('点击重置后回到 0', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: '+1' }))
    await user.click(screen.getByRole('button', { name: '+1' }))
    // 此时 count = 2
    await user.click(screen.getByRole('button', { name: '重置' }))

    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})
