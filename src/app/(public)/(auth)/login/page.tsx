"use client";
import { useAuth } from "@/hooks/useAuth";
import { Button, Form, Input, message } from "antd";


export default function LoginPage() {
  const { login } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values);
    } catch {
      messageApi.error("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {contextHolder}
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Login</h2>
        </div>
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
