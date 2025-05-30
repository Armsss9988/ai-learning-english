"use client";

import { Button, Typography, Space, Avatar, Dropdown, MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";
import { UserOutlined, BookOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function Header() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { logout } = useAuth();
  const router = useRouter();

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: <span onClick={() => router.push("/profile")}>Profile</span>,
    },
    {
      key: "logout",
      label: <span onClick={logout}>Logout</span>,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect shadow-lg">
      <div
        className="px-8 py-4 flex justify-between items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOutlined className="text-white text-2xl" />
            <div
              onClick={() => router.push("/")}
              className="font-bold text-white text-xl md:text-3xl hover:text-amber-200 cursor-pointer transition-all duration-300 hover:scale-105"
            >
              IELTS Learning Hub
            </div>
          </div>
          <div className="hidden md:block text-emerald-100 text-sm font-medium">
            AI-Powered English Learning
          </div>
        </div>

        <div>
          {isAuthenticated ? (
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <div className="flex items-center gap-3 cursor-pointer bg-white/20 rounded-full px-4 py-2 hover:bg-white/30 transition-all duration-300">
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  className="bg-emerald-600 border-2 border-white"
                />
                <Text strong className="!text-white hidden md:block">
                  {user?.name}
                </Text>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Button
                type="text"
                className="!text-white hover:!text-amber-200 hover:!bg-white/10 !border-none !rounded-full !px-6"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
              <Button
                className="!rounded-full !bg-white !text-emerald-700 hover:!text-emerald-800 !border-none !px-6 !py-2 hover:!bg-amber-50 hover:!scale-105 transition-all duration-300 !shadow-lg"
                onClick={() => router.push("/register")}
              >
                Register
              </Button>
            </Space>
          )}
        </div>
      </div>
    </header>
  );
}
