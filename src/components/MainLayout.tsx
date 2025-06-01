"use client";

import { useChatbot } from "@/providers/ChatbotProvider";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isOpen, width } = useChatbot();

  return (
    <div
      className="pt-24 min-h-screen animate-fade-in transition-all duration-300 ease-in-out"
      style={{
        marginRight: isOpen ? `${width + 32}px` : "0px", // width + gap
      }}
    >
      {children}
    </div>
  );
}
