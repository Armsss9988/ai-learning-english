import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import Header from "@/components/Header";
import { ReduxProvider } from "@/providers/ReduxProvider";
import AIChatbot from "@/components/AIChatbot";
import AuthInitializer from "@/components/AuthInitializer";
import { NavigationProvider } from "@/providers/NavigationProvider";
import { ChatbotProvider } from "@/providers/ChatbotProvider";
import { Suspense } from "react";
import { Spin } from "antd";
import { BookOutlined } from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "AI Learning English",
    description:
      "AI Learning English - Master IELTS with AI-powered learning paths",
    icons: {
      icon: "/icon.svg",
    },
  };
}

// Loading component for Suspense fallback
function AppLoadingFallback() {
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
          <p className="text-gray-500">Initializing application...</p>
        </div>
      </div>
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="mdl-js">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen text-stone-800 font-sans`}
        style={{
          background:
            "linear-gradient(135deg, #ecfdf5 0%, #fffbeb 50%, #f0fdfa 100%)",
          minHeight: "100vh",
        }}
      >
        <Suspense fallback={<AppLoadingFallback />}>
          <ReduxProvider>
            <QueryProvider>
              <NavigationProvider>
                <ChatbotProvider>
                  <AuthInitializer />
                  <Header />
                  <MainLayout>{children}</MainLayout>
                  <AIChatbot />
                </ChatbotProvider>
              </NavigationProvider>
            </QueryProvider>
          </ReduxProvider>
        </Suspense>
      </body>
    </html>
  );
}
