"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { ApiResponse } from "@/constants/apiCode";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  lessonContext?: {
    lessonId: string;
    lessonTitle: string;
  };
}

interface ChatResponse {
  response: string;
  hasLessonContext: boolean;
  lessonTitle?: string;
}

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý AI học IELTS của bạn. Tôi có thể giúp bạn với nội dung bài học và các câu hỏi về IELTS. Bạn có thể hỏi tôi bất cứ điều gì!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string, lessonId?: string): Promise<void> => {
      if (!text.trim()) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: text.trim(),
        timestamp: new Date(),
        lessonContext: lessonId ? { lessonId, lessonTitle: "" } : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await api.post("/chat", {
          message: text.trim(),
          lessonId: lessonId || currentLessonId,
        });

        const apiResponse: ApiResponse<ChatResponse> = response.data;

        if (apiResponse.status === "success" && apiResponse.data) {
          const botMessage: ChatMessage = {
            id: `bot_${Date.now()}`,
            sender: "bot",
            text: apiResponse.data.response,
            timestamp: new Date(),
            lessonContext: apiResponse.data.hasLessonContext
              ? {
                  lessonId: lessonId || currentLessonId || "",
                  lessonTitle: apiResponse.data.lessonTitle || "",
                }
              : undefined,
          };

          setMessages((prev) => [...prev, botMessage]);
        } else {
          throw new Error(apiResponse.message || "Failed to get response");
        }
      } catch (error) {
        console.error("Chat error:", error);

        // Add error message
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          sender: "bot",
          text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentLessonId]
  );

  const setLessonContext = useCallback((lessonId: string | null) => {
    setCurrentLessonId(lessonId);

    if (lessonId) {
      const contextMessage: ChatMessage = {
        id: `context_${Date.now()}`,
        sender: "bot",
        text: "Tôi đã tải ngữ cảnh bài học. Bây giờ bạn có thể hỏi tôi về nội dung bài học này!",
        timestamp: new Date(),
        lessonContext: { lessonId, lessonTitle: "" },
      };

      setMessages((prev) => [...prev, contextMessage]);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "Xin chào! Tôi là trợ lý AI học IELTS của bạn. Tôi có thể giúp bạn với nội dung bài học và các câu hỏi về IELTS. Bạn có thể hỏi tôi bất cứ điều gì!",
        timestamp: new Date(),
      },
    ]);
    setCurrentLessonId(null);
  }, []);

  return {
    messages,
    isLoading,
    currentLessonId,
    sendMessage,
    setLessonContext,
    clearMessages,
  };
}
