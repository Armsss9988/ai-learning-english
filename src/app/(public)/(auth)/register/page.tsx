"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button, Form, Input, message, Card, Typography } from "antd";
import { useState } from "react";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const { register } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      await register(values);
      messageApi.success("Registration successful! Redirecting...");
    } catch (error: unknown) {
      // Handle different types of errors with new API format
      if (error && typeof error === "object" && "apiResponse" in error) {
        const apiError = error as {
          apiResponse: { message: string; errors?: string[]; code: number };
        };

        // Show specific error message from API
        if (
          apiError.apiResponse.errors &&
          apiError.apiResponse.errors.length > 0
        ) {
          messageApi.error(apiError.apiResponse.errors.join(", "));
        } else {
          messageApi.error(apiError.apiResponse.message);
        }
      } else if (error && typeof error === "object" && "response" in error) {
        // Fallback for old format or axios errors
        const axiosError = error as {
          response: { status: number; data: { error: string } };
        };
        if (axiosError.response?.status === 400) {
          messageApi.error("User already exists with this email");
        } else if (axiosError.response?.data?.error) {
          messageApi.error(axiosError.response.data.error);
        } else {
          messageApi.error("Registration failed. Please try again.");
        }
      } else {
        messageApi.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      {contextHolder}
      <div className="max-w-md w-full animate-slide-in-up">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <BookOutlined className="text-emerald-600 text-4xl" />
            <Title level={2} className="!text-stone-800 !mb-0">
              IELTS Learning Hub
            </Title>
          </div>
          <Text className="text-stone-600 text-lg">
            Start your IELTS learning journey today
          </Text>
        </div>

        {/* Register Card */}
        <Card
          className="border-0 shadow-xl"
          style={{
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(236, 253, 245, 0.8) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="p-6">
            <Title level={3} className="text-center !text-emerald-700 !mb-6">
              Create Account
            </Title>

            <Form onFinish={handleRegister} layout="vertical" size="large">
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-stone-400" />}
                  placeholder="Enter your full name"
                  className="!border-emerald-300 focus:!border-emerald-500"
                  style={{ borderRadius: "12px", padding: "12px 16px" }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-stone-400" />}
                  placeholder="Enter your email"
                  className="!border-emerald-300 focus:!border-emerald-500"
                  style={{ borderRadius: "12px", padding: "12px 16px" }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-stone-400" />}
                  placeholder="Create a password"
                  className="!border-emerald-300 focus:!border-emerald-500"
                  style={{ borderRadius: "12px", padding: "12px 16px" }}
                />
              </Form.Item>

              <Form.Item className="!mb-6">
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                  block
                  className="!h-14 !text-lg !font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #d97706 100%)",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 6px 16px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Text className="text-stone-500">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Sign in here
                </a>
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
