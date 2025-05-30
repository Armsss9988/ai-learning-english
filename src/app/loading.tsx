// app/page.tsx → loading.tsx nằm cùng cấp
import { Spin } from "antd";
import { BookOutlined } from "@ant-design/icons";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <BookOutlined className="text-6xl text-emerald-500 animate-pulse" />
        </div>
        <Spin size="large" />
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-700">
            AI Learning English
          </h3>
          <p className="text-gray-500">Preparing your learning experience...</p>
        </div>
      </div>
    </div>
  );
}
