"use client";

import { Button, Typography, Space, Avatar, Dropdown, MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

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
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-blue-900 to-blue-50 shadow-md px-8 py-4 flex justify-between items-center shadow-black">
      <div className="flex items-center gap-3">

        <Title level={3} className="!mb-0 !text-white">
          IELTS Learning Path Generator
        </Title>
      </div>

      <div>
        {isAuthenticated ? (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar size="large" icon={<UserOutlined />} />
              <Text strong className="!text-white">{user?.name}</Text>
            </div>
          </Dropdown>
        ) : (
          <Space>
            <Button type="text" className="!text-white" onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button type="primary" className="!rounded-full !bg-white !text-blue-700 hover:!text-blue-900" onClick={() => router.push("/register")}>
              Register
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
}
