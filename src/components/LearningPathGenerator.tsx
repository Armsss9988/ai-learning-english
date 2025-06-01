"use client";
import { useState } from "react";
import { Button, Input, Card, Typography, Space, message } from "antd";
import { LearningPath } from "@prisma/client";
import LearningPathViewer from "./LearningPathViewer";
import { RocketOutlined, TrophyOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

export default function LearningPathGenerator() {
  const [startLevel, setStartLevel] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);

  const validateIELTSLevel = (level: string) => {
    const num = parseFloat(level);
    return (
      !isNaN(num) && num >= 0 && num <= 9 && num * 2 === Math.round(num * 2)
    );
  };

  const generateLearningPath = async () => {
    if (!validateIELTSLevel(startLevel) || !validateIELTSLevel(targetLevel)) {
      message.error("Please enter valid IELTS levels (0.0 to 9.0, step 0.5)");
      return;
    }

    if (parseFloat(targetLevel) <= parseFloat(startLevel)) {
      message.error("Target level must be higher than current level");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startLevel, targetLevel }),
      });
      const data = await response.json();
      setLearningPath(data);
      message.success("Learning path generated successfully!");
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to generate learning path");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card
        className="shadow-xl border-0 animate-slide-in-up"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(236, 253, 245, 0.8) 100%)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
        }}
      >
        <div className="p-6">
          <div className="text-center mb-8">
            <Title level={3} className="!text-emerald-700 !mb-2">
              <RocketOutlined className="mr-2" />
              IELTS Level Assessment
            </Title>
            <Text className="text-stone-600">
              Enter your current and target IELTS levels to get started
            </Text>
          </div>

          <Space direction="vertical" size="large" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Text strong className="text-stone-700 flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                  Current IELTS Level
                </Text>
                <Input
                  type="number"
                  min={0}
                  max={9}
                  step={0.5}
                  value={startLevel}
                  onChange={(e) => setStartLevel(e.target.value)}
                  placeholder="e.g., 5.0"
                  size="large"
                  className="!border-amber-300 focus:!border-amber-500"
                  style={{ borderRadius: "16px" }}
                />
              </div>

              <div className="space-y-3">
                <Text strong className="text-stone-700 flex items-center gap-2">
                  <TrophyOutlined className="text-emerald-600 !mr-1" />
                  Target IELTS Level
                </Text>
                <Input
                  type="number"
                  min={0}
                  max={9}
                  step={0.5}
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  placeholder="e.g., 7.0"
                  size="large"
                  className="!border-emerald-300 focus:!border-emerald-500"
                  style={{ borderRadius: "16px" }}
                />
              </div>
            </div>

            <Button
              type="primary"
              onClick={generateLearningPath}
              loading={loading}
              size="large"
              block
              disabled={!startLevel || !targetLevel}
              className="!h-14 !text-lg !font-semibold !mt-8"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #d97706 100%)",
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
              }}
            >
              {loading ? "Generating Your Path..." : "Generate Learning Path"}
            </Button>
          </Space>
        </div>
      </Card>

      {learningPath && (
        <div className="animate-slide-in-up">
          <LearningPathViewer
            learningPath={learningPath!}
            onSave={() => setLearningPath(null)}
          />
        </div>
      )}
    </div>
  );
}
