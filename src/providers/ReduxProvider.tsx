"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useEffect, useState } from "react";
import { Skeleton } from "antd";
import { verify } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import "@ant-design/v5-patch-for-react-19";
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (token) {
        try {
          await api.get("/auth/verify");
          store.dispatch(verify());
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      }
      setLoading(false); // Luôn setLoading về false dù thành công hay fail
    };

    checkUser();
  }, []);

  if (loading) {
    return <Skeleton active />;
  }

  return <Provider store={store}>{children}</Provider>;
}
