const fetchMessage = () => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('这是异步加载的消息！')
    }, 2000)
  })
}
const AsyncChild = ({
  messagePromise
}: {
  messagePromise: Promise<string>
}) => {
  // 状态
  //   const [message, setMessage] = useState<string | null>(null);
  // 副作用
  //   useEffect(() => {

  //     const loadMessage = async () => {
  //       const msg = await fetchMessage();
  //       setMessage(msg);
  //     };
  //     loadMessage();
  //   }, []);

  const message = use(messagePromise)
  return <div>{message}</div>
}

const messagePromise = fetchMessage()

const SuspenseDemo = () => {
  return (
    <div>
      <h2>Suspense 演示</h2>
      <p>
        <Tag color="blue">Suspense</Tag> 是 React
        内置的一个组件，用于处理组件树中的异步加载状态。
      </p>
      <p>
        当 Suspense 包裹的组件正在加载时，会显示 fallback
        属性指定的内容，加载完成后会自动切换到正常渲染。
      </p>
      <Suspense fallback={<div>加载中...</div>}>
        <AsyncChild messagePromise={messagePromise} />
      </Suspense>
    </div>
  )
}

export default SuspenseDemo
