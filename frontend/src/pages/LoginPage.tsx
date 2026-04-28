import { Button, Card, Form, Input, Tabs, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const submitLogin = async (values: { email: string; password: string }) => {
    await login(values.email, values.password);
    message.success('登录成功');
    navigate('/projects');
  };
  const submitRegister = async (values: { email: string; password: string; nickname?: string }) => {
    await register(values.email, values.password, values.nickname);
    await login(values.email, values.password);
    message.success('注册成功');
    navigate('/projects');
  };
  return (
    <div className="auth-page">
      <Card title="Manual Canvas AI" className="auth-card">
        <Tabs items={[
          { key: 'login', label: '登录', children: <Form layout="vertical" onFinish={submitLogin}><Form.Item name="email" label="邮箱" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="password" label="密码" rules={[{ required: true }]}><Input.Password /></Form.Item><Button type="primary" htmlType="submit" block>登录</Button></Form> },
          { key: 'register', label: '注册', children: <Form layout="vertical" onFinish={submitRegister}><Form.Item name="nickname" label="昵称"><Input /></Form.Item><Form.Item name="email" label="邮箱" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item><Button type="primary" htmlType="submit" block>注册</Button></Form> },
        ]} />
      </Card>
    </div>
  );
}
