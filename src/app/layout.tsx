"use server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import Header from "@/components/Header";
import { ReduxProvider } from "@/providers/ReduxProvider";

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
    description: "AI Learning English",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen bg-gray-600 text-gray-900 font-sans`}
      >
        <ReduxProvider>
          <QueryProvider>
            <Header />
            <div className="pt-30 h-full">{children}</div>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
