"use client";
import { useState, useRef, useEffect } from "react";
import { Button, Input, Typography, Spin, Badge, Tooltip, message } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
  BookOutlined,
  ClearOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useChatbot as useChatbotHook } from "@/hooks/useChatbot";
import { useChatbot as useChatbotContext } from "@/providers/ChatbotProvider";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const { Text } = Typography;

// Component để copy code
const CodeBlock = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      messageApi.success("Đã copy code!");
    } catch (error) {
      console.error("Copy failed:", error);
      messageApi.error("Không thể copy code");
    }
  };

  const language = className?.replace("language-", "") || "";

  return (
    <>
      {contextHolder}
      <div className="relative group">
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto my-2 text-xs">
          <code className={className}>{children}</code>
        </pre>
        <Tooltip title="Copy code" zIndex={2200}>
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={copyToClipboard}
          />
        </Tooltip>
        {language && (
          <span className="absolute top-2 left-2 text-xs text-gray-500 bg-gray-200 px-1 rounded">
            {language}
          </span>
        )}
      </div>
    </>
  );
};

export default function AIChatbot() {
  const [input, setInput] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Use both hooks
  const {
    messages,
    isLoading,
    currentLessonId,
    sendMessage,
    setLessonContext,
    clearMessages,
  } = useChatbotHook();

  const { isOpen, setIsOpen, width, setWidth } = useChatbotContext();

  const pathname = usePathname();

  // Auto-detect lesson context from URL
  useEffect(() => {
    try {
      const lessonMatch = pathname.match(/\/lesson\/([^\/]+)/);
      if (lessonMatch) {
        const lessonId = lessonMatch[1];
        if (lessonId !== currentLessonId) {
          setLessonContext(lessonId);
        }
      } else if (currentLessonId) {
        // Clear lesson context when not on a lesson page
        setLessonContext(null);
      }
    } catch (error) {
      console.error("Error detecting lesson context:", error);
    }
  }, [pathname, currentLessonId, setLessonContext]);

  useEffect(() => {
    try {
      if (isOpen && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error scrolling to bottom:", error);
    }
  }, [messages, isOpen]);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;

      const newWidth = window.innerWidth - e.clientX - 32; // 32px margin from right
      const minWidth = 300;
      const maxWidth = 600;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setWidth]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    try {
      const messageText = input;
      setInput("");
      await sendMessage(messageText);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Component để render markdown content
  const MarkdownMessage = ({
    content,
    isUser,
  }: {
    content: string;
    isUser: boolean;
  }) => {
    if (isUser) {
      // User messages hiển thị bình thường
      return (
        <Text className="!text-white">
          {content.split("\n").map((line, index) => (
            <span key={index}>
              {line}
              {index < content.split("\n").length - 1 && <br />}
            </span>
          ))}
        </Text>
      );
    }

    // AI messages được render dạng markdown
    return (
      <div className="chatbot-markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Override các component để sử dụng class từ CSS
            code: ({ className, children }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <CodeBlock className={className}>{String(children)}</CodeBlock>
              );
            },
            table: ({ children }) => (
              <table className="border-collapse border border-gray-300 text-xs my-2 w-full">
                {children}
              </table>
            ),
            thead: ({ children }) => <thead>{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr>{children}</tr>,
            th: ({ children }) => (
              <th className="border border-gray-300 px-2 py-1 text-left bg-gray-100 font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-2 py-1 text-left">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed right-12 bottom-12 z-[9999]">
          <Badge
            count={currentLessonId ? 1 : 0}
            dot
            offset={[-8, 8]}
            style={
              {
                "--ant-badge-dot-color": "#10b981",
                "--ant-badge-dot-shadow": "0 0 0 2px rgba(16, 185, 129, 0.3)",
              } as React.CSSProperties
            }
          >
            <Button
              type="primary"
              shape="circle"
              icon={<MessageOutlined />}
              size="large"
              className="
                !w-16 !h-16
                bg-gradient-to-br from-emerald-600 to-amber-600
                border-none shadow-lg shadow-emerald-500/40
                animate-bounce hover:animate-none
                hover:scale-110 transition-transform duration-300
                flex items-center justify-center
              "
              onClick={() => setIsOpen(true)}
            />
          </Badge>
        </div>
      )}
      {isOpen && (
        <div
          ref={resizeRef}
          className="
          fixed right-8 bottom-8 max-h-[600px] z-[2000]
          bg-white/95 backdrop-blur-xl
          rounded-3xl shadow-2xl
          flex flex-col
          animate-slide-in-up
        "
          style={{
            width: `${width}px`,
          }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors rounded-l-3xl"
            onMouseDown={startResize}
          />

          {/* Header */}
          <div
            className="
            bg-gradient-to-r from-emerald-600 to-amber-600
            rounded-t-3xl p-4
            flex justify-between items-center
          "
          >
            <div className="flex items-center gap-3">
              <RobotOutlined className="text-xl text-white" />
              <div className="flex flex-col">
                <Text className="!text-white !text-lg font-semibold">
                  AI Learning Assistant
                </Text>
                {currentLessonId && (
                  <div className="flex items-center gap-1">
                    <BookOutlined className="text-xs text-emerald-200" />
                    <Text className="!text-emerald-200 !text-xs">
                      Lesson Context Active
                    </Text>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <Tooltip title="Clear conversation" zIndex={2100}>
                  <Button
                    type="text"
                    icon={<ClearOutlined />}
                    onClick={clearMessages}
                    className="
                      !text-white hover:!bg-white/20 !border-none
                      transition-colors duration-200
                    "
                    size="small"
                  />
                </Tooltip>
              )}
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setIsOpen(false)}
                className="
                  !text-white hover:!bg-white/20 !border-none
                  transition-colors duration-200
                "
              />
            </div>
          </div>

          {/* Messages */}
          <div
            className="
            flex-1 overflow-y-auto p-4 space-y-4 h-96
            bg-gradient-to-br from-emerald-50 to-amber-50
          "
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-3 shadow-sm
                    ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                        : "bg-white border border-stone-200 text-stone-700"
                    }
                  `}
                >
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-2 mb-2">
                      <RobotOutlined className="text-emerald-600" />
                      <Text className="text-xs font-medium text-stone-500">
                        AI Assistant
                      </Text>
                      {msg.lessonContext && (
                        <Badge
                          size="small"
                          count={<BookOutlined className="text-xs" />}
                          className="ml-1"
                        />
                      )}
                    </div>
                  )}
                  <MarkdownMessage
                    content={msg.text}
                    isUser={msg.sender === "user"}
                  />
                  <div className="mt-1">
                    <Text
                      className={`text-xs ${
                        msg.sender === "user"
                          ? "!text-emerald-100"
                          : "!text-stone-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <RobotOutlined className="text-emerald-600" />
                    <Spin size="small" />
                    <Text className="text-stone-500">AI đang suy nghĩ...</Text>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="
            p-4 bg-white border-t border-stone-200
            rounded-b-3xl
          "
          >
            <div className="flex gap-3">
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  currentLessonId
                    ? "Hỏi về bài học hoặc IELTS..."
                    : "Hỏi về IELTS..."
                }
                className="
                  flex-1 !border-emerald-300 focus:!border-emerald-500
                  !rounded-2xl resize-none
                "
                autoSize={{ minRows: 1, maxRows: 3 }}
                autoFocus
                disabled={isLoading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                loading={isLoading}
                className={`
                  !rounded-full !px-4 !border-none self-end
                  flex items-center justify-center
                  transition-all duration-200 min-w-[40px] h-[40px]
                  ${
                    input.trim() && !isLoading
                      ? "bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700"
                      : "!bg-stone-300 cursor-not-allowed"
                  }
                `}
              />
            </div>

            {/* Context indicator */}
            {currentLessonId && (
              <div className="mt-2 flex items-center gap-2">
                <BookOutlined className="text-emerald-600 text-xs" />
                <Text className="text-xs text-stone-500">
                  Đang trong ngữ cảnh bài học - AI có thể trả lời về nội dung
                  bài
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
