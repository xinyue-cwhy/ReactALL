import {} from 'react'
import { useTheme } from '../../../context/ThemeContext'
import type { InputRef } from 'antd'

interface FormValues {
  username: string
  email: string
  password: string
  confirm: string
  gender: string
  agree: boolean
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirm?: string
  gender?: string
  agree?: string
}

const initialValues: FormValues = {
  username: '',
  email: '',
  password: '',
  confirm: '',
  gender: '',
  agree: false
}

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {}

  if (!values.username.trim()) {
    errors.username = '用户名不能为空'
  } else if (values.username.length < 2) {
    errors.username = '用户名至少 2 个字符'
  }

  if (!values.email) {
    errors.email = '邮箱不能为空'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = '邮箱格式不正确'
  }

  if (!values.password) {
    errors.password = '密码不能为空'
  } else if (values.password.length < 6) {
    errors.password = '密码至少 6 位'
  }

  if (!values.confirm) {
    errors.confirm = '请确认密码'
  } else if (values.confirm !== values.password) {
    errors.confirm = '两次密码不一致'
  }

  if (!values.gender) {
    errors.gender = '请选择性别'
  }

  if (!values.agree) {
    errors.agree = '请阅读并同意用户协议'
  }

  return errors
}

const FormDemo = () => {
  const { theme } = useTheme()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState<FormValues | null>(null)
  const inputRef = useRef<InputRef>(null)
  const handleChange = (field: keyof FormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    // 实时清除该字段的错误
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    inputRef.current?.focus()
    setSubmitted(values)
    setValues(initialValues)
    setErrors({})
  }

  const handleReset = () => {
    setValues(initialValues)
    setErrors({})
    setSubmitted(null)
  }

  useEffect(() => {
    if (!values.username || values.username.length < 2) {
      window.document.title = '受控表单演示'
      return
    }
    window.document.title = `欢迎你，${values.username}`
  }, [values.username])
  return (
    <div>
      <div>theme: {theme}</div>
      <Typography.Title level={3}>受控表单演示</Typography.Title>
      <Typography.Paragraph>
        <Tag color="blue">useState</Tag> 控制每个字段的值，
        <Tag color="green">校验</Tag> 在提交时统一触发，
        <Tag color="orange">实时清错</Tag> 在输入时清除对应错误
      </Typography.Paragraph>

      <Row gutter={[24, 0]}>
        <Col span={12}>
          <Card title="注册表单">
            <form onSubmit={handleSubmit} noValidate>
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* 用户名 */}
                <div>
                  <div style={{ marginBottom: 4 }}>用户名</div>
                  <Input
                    value={values.username}
                    ref={inputRef}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="请输入用户名"
                    status={errors.username ? 'error' : ''}
                  />
                  {errors.username && (
                    <div
                      style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.username}
                    </div>
                  )}
                </div>

                {/* 邮箱 */}
                <div>
                  <div style={{ marginBottom: 4 }}>邮箱</div>
                  <Input
                    type="email"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="请输入邮箱"
                    status={errors.email ? 'error' : ''}
                  />
                  {errors.email && (
                    <div
                      style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* 密码 */}
                <div>
                  <div style={{ marginBottom: 4 }}>密码</div>
                  <Input
                    type="password"
                    value={values.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="至少 6 位"
                    status={errors.password ? 'error' : ''}
                  />
                  {errors.password && (
                    <div
                      style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* 确认密码 */}
                <div>
                  <div style={{ marginBottom: 4 }}>确认密码</div>
                  <Input
                    type="password"
                    value={values.confirm}
                    onChange={(e) => handleChange('confirm', e.target.value)}
                    placeholder="再次输入密码"
                    status={errors.confirm ? 'error' : ''}
                  />
                  {errors.confirm && (
                    <div
                      style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.confirm}
                    </div>
                  )}
                </div>

                {/* 性别 */}
                <div>
                  <div style={{ marginBottom: 4 }}>性别</div>
                  <Select
                    style={{ width: '100%' }}
                    value={values.gender || undefined}
                    onChange={(v) => handleChange('gender', v)}
                    placeholder="请选择性别"
                    status={errors.gender ? 'error' : ''}
                    options={[
                      { value: 'male', label: '男' },
                      { value: 'female', label: '女' },
                      { value: 'other', label: '其他' }
                    ]}
                  />
                  {errors.gender && (
                    <div
                      style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.gender}
                    </div>
                  )}
                </div>

                {/* 用户协议 */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={values.agree}
                      onChange={(e) => handleChange('agree', e.target.checked)}
                    />
                    我已阅读并同意用户协议
                  </label>
                  {errors.agree && (
                    <div
                      style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.agree}
                    </div>
                  )}
                </div>

                <Space>
                  <Button type="primary" htmlType="submit">
                    注册
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Space>
            </form>
          </Card>
        </Col>

        {/* 提交结果 */}
        <Col span={12}>
          <Card title="提交结果">
            <Button
              type="primary"
              onClick={handleReset}
              style={{ marginBottom: 16 }}
            >
              重置表单
            </Button>
            {submitted ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert message="注册成功！" type="success" showIcon />
                <div>用户名：{submitted.username}</div>
                <div>邮箱：{submitted.email}</div>
                <div>
                  性别：
                  {submitted.gender === 'male'
                    ? '男'
                    : submitted.gender === 'female'
                      ? '女'
                      : '其他'}
                </div>
              </Space>
            ) : (
              <Typography.Text type="secondary">
                提交表单后在这里显示结果
              </Typography.Text>
            )}
          </Card>

          <Card title="实时数据（values state）" style={{ marginTop: 16 }}>
            <pre style={{ fontSize: 12, margin: 0 }}>
              {JSON.stringify(
                { ...values, password: '***', confirm: '***' },
                null,
                2
              )}
            </pre>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default FormDemo
