'use client';

import { useAuth } from "@/hooks/useAuth";
import { Button, Form, Input, message } from "antd";

export default function RegisterPage() {
  const { register } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const handleRegister = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      await register(values);
      messageApi.success("Registered successfully");
    } catch {
      messageApi.error("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {contextHolder}
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Register</h2>
        </div>
        <Form onFinish={handleRegister} layout="vertical">
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input placeholder="Name" size="large" />
          </Form.Item>
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
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
} 