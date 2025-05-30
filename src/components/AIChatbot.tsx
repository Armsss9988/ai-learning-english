"use client";
import { useState, useRef, useEffect } from "react";
import { Button, Input, Typography } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I'm your AI learning assistant. How can I help you with your IELTS preparation today?",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user" as const, text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    // Simulate AI response (replace with real API call)
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          sender: "bot",
          text: "Thank you for your question! I'm here to help with your IELTS learning journey. Let me assist you with that.",
        },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <div className="fixed right-12 bottom-12 z-[9999]">
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
            onClick={() => setOpen(true)}
          />
        </div>
      )}
      {open && (
        <div
          className="
          fixed right-8 bottom-8 w-96 max-h-[520px] z-[2000]
          bg-white/95 backdrop-blur-xl
          rounded-3xl shadow-2xl
          flex flex-col
          animate-slide-in-up
        "
        >
          <div
            className="
            bg-gradient-to-r from-emerald-600 to-amber-600
            rounded-t-3xl p-4
            flex justify-between items-center
          "
          >
            <div className="flex items-center gap-3">
              <RobotOutlined className="text-xl text-white" />
              <Text className="!text-white !text-lg font-semibold">
                AI Learning Assistant
              </Text>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setOpen(false)}
              className="
                !text-white hover:!bg-white/20 !border-none
                transition-colors duration-200
              "
            />
          </div>
          <div
            className="
            flex-1 overflow-y-auto p-4 space-y-4 h-80
            bg-gradient-to-br from-emerald-50 to-amber-50
          "
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
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
                    </div>
                  )}
                  <Text
                    className={
                      msg.sender === "user" ? "!text-white" : "!text-stone-700"
                    }
                  >
                    {msg.text}
                  </Text>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div
            className="
            p-4 bg-white border-t border-stone-200
            rounded-b-3xl
          "
          >
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={sendMessage}
                placeholder="Ask me anything about IELTS..."
                className="
                  flex-1 !border-emerald-300 focus:!border-emerald-500
                  !rounded-2xl h-10
                "
                autoFocus
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`
                  !rounded-full !px-4 !border-none h-10 w-10
                  flex items-center justify-center
                  transition-all duration-200
                  ${
                    input.trim()
                      ? "bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700"
                      : "!bg-stone-300 cursor-not-allowed"
                  }
                `}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
