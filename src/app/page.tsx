"use client";
import { Card, Typography, Button } from "antd";
import {
  RocketOutlined,
  TrophyOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-6xl mx-auto text-center animate-slide-in-up">
          <div className="mb-8">
            <Title
              level={1}
              className="!text-4xl md:!text-6xl !text-stone-800 !mb-4"
            >
              Master IELTS with{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Learning
            </Title>
            <Paragraph className="!text-xl !text-stone-600 max-w-3xl mx-auto">
              Transform your IELTS preparation with personalized learning paths,
              AI-driven assessments, and interactive lessons designed to help
              you achieve your target score faster and more effectively.
            </Paragraph>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/learning-paths">
              <Button
                size="large"
                className="!h-14 !px-8 !text-lg !font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #059669 0%, #d97706 100%)",
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
                  color: "white",
                }}
              >
                Start Learning Now
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="large"
                className="!h-14 !px-8 !text-lg !font-semibold !border-2 !border-emerald-500 !text-emerald-600 hover:!bg-emerald-50"
                style={{ borderRadius: "16px" }}
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up"
            style={{
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(236, 253, 245, 0.8) 100%)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <RocketOutlined className="text-white text-2xl" />
              </div>
              <Title level={4} className="!text-stone-800 !mb-3">
                Personalized Learning Paths
              </Title>
              <Text className="!text-stone-600">
                AI creates custom study plans based on your current level and
                target score, ensuring efficient and focused preparation.
              </Text>
            </div>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up"
            style={{
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 251, 235, 0.8) 100%)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BulbOutlined className="text-white text-2xl" />
              </div>
              <Title level={4} className="!text-stone-800 !mb-3">
                Interactive AI Assistant
              </Title>
              <Text className="!text-stone-600">
                Get instant help, explanations, and guidance from our AI tutor
                available 24/7 to support your learning journey.
              </Text>
            </div>
          </Card>

          <Card
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up md:col-span-2 lg:col-span-1"
            style={{
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 250, 0.8) 100%)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyOutlined className="text-white text-2xl" />
              </div>
              <Title level={4} className="!text-stone-800 !mb-3">
                Real-time Assessment
              </Title>
              <Text className="!text-stone-600">
                Practice with authentic IELTS-style questions and receive
                immediate feedback to track your progress and identify areas for
                improvement.
              </Text>
            </div>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <Title level={2} className="!text-stone-800 !mb-8">
            Join Thousands of Successful Students
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <Title level={1} className="!text-emerald-600 !mb-2">
                95%
              </Title>
              <Text className="!text-stone-600 !text-lg">Success Rate</Text>
            </div>
            <div className="p-6">
              <Title level={1} className="!text-amber-600 !mb-2">
                50K+
              </Title>
              <Text className="!text-stone-600 !text-lg">
                Students Worldwide
              </Text>
            </div>
            <div className="p-6">
              <Title level={1} className="!text-teal-600 !mb-2">
                7.5
              </Title>
              <Text className="!text-stone-600 !text-lg">
                Average Score Increase
              </Text>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20">
          <Card
            className="border-0 shadow-xl text-center"
            style={{
              borderRadius: "24px",
              background: "linear-gradient(135deg, #059669 0%, #d97706 100%)",
              color: "white",
            }}
          >
            <div className="p-12">
              <Title level={2} className="!text-white !mb-4">
                Ready to Start Your IELTS Journey?
              </Title>
              <Text className="!text-emerald-100 !text-lg !mb-8 block">
                Create your personalized learning path today and take the first
                step towards achieving your IELTS goals.
              </Text>
              <Link href="/learning-paths">
                <Button
                  size="large"
                  className="!h-14 !px-12 !text-lg !font-semibold !bg-white !text-emerald-700 hover:!bg-amber-50 !border-none"
                  style={{ borderRadius: "16px" }}
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
