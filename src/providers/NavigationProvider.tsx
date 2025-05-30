"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Progress } from "antd";

interface NavigationContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Stop loading when pathname changes (navigation complete)
    if (isLoading) {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }
  }, [pathname, isLoading]);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;

    if (isLoading) {
      setProgress(0);
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 150);
    }

    return () => {
      clearInterval(progressTimer);
    };
  }, [isLoading]);

  const startLoading = () => {
    setIsLoading(true);
  };

  const stopLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200);
  };

  return (
    <NavigationContext.Provider
      value={{ isLoading, startLoading, stopLoading }}
    >
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor={{
              "0%": "#10b981",
              "100%": "#059669",
            }}
            trailColor="transparent"
            strokeWidth={3}
            className="navigation-progress"
          />
          <style jsx global>{`
            .navigation-progress .ant-progress-bg {
              transition: width 0.3s ease;
            }
          `}</style>
        </div>
      )}
      {children}
    </NavigationContext.Provider>
  );
}
