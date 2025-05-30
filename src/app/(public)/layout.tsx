"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading and authenticated
    if (!loading && isAuthenticated) {
      router.replace("/learning-paths");
    }
  }, [isAuthenticated, loading, router]);

  // While loading, show the children (no redirect yet)
  if (loading) {
    return <div>{children}</div>;
  }

  return <div>{children}</div>;
}
