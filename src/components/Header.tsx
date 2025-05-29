"use client";

import { Button, Typography, Space, Avatar, Dropdown, MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";
import { UserOutlined } from "@ant-design/icons";

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
    <div
      onClick={() => router.push("/")}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-blue-900/50 to-blue-50 shadow-md px-8 py-4 flex justify-between items-center shadow-black"
    >
      <div className="flex items-center gap-3">
        <div className="font-sans !mb-0 text-[#eeeef6] text-xl md:text-4xl hover:!text-blue-900 font-bold cursor-pointer">
          IELTS Learning Path Generator
        </div>
      </div>

      <div>
        {isAuthenticated ? (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar size="large" icon={<UserOutlined />} />
              <Text strong className="!text-white">
                {user?.name}
              </Text>
            </div>
          </Dropdown>
        ) : (
          <Space>
            <Button
              type="text"
              className="!text-white"
              onClick={() => router.replace("/login")}
            >
              Login
            </Button>
            <Button
              className="!rounded-full !bg-white !text-blue-700 hover:!text-blue-900"
              onClick={() => router.replace("/register")}
            >
              Register
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
}
