"use server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import Header from "@/components/Header";
import { ReduxProvider } from "@/providers/ReduxProvider";
import AIChatbot from "@/components/AIChatbot";
import AuthInitializer from "@/components/AuthInitializer";

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
  };
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
        <ReduxProvider>
          <QueryProvider>
            <AuthInitializer />
            <Header />
            <div className="pt-24 min-h-screen animate-fade-in">{children}</div>
            <AIChatbot />
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
