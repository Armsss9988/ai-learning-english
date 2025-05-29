"use client";
import { useState } from "react";
import { Button, Input, Card, Typography, Space, message } from "antd";
import { LearningPath } from "@prisma/client";
import LearningPathViewer from "./LearningPathViewer";

const { Text } = Typography;

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
    setLoading(true);
    try {
      const response = await fetch("/api/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startLevel, targetLevel }),
      });
      const data = await response.json();
      setLearningPath(data);
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to generate learning path");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Text strong>Current IELTS Level</Text>
          <Input
            type="number"
            min={0}
            max={9}
            step={0.5}
            value={startLevel}
            onChange={(e) => setStartLevel(e.target.value)}
            placeholder="e.g., 5.0"
            size="large"
          />
        </div>
        <div>
          <Text strong>Target IELTS Level</Text>
          <Input
            type="number"
            min={0}
            max={9}
            step={0.5}
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            placeholder="e.g., 7.0"
            size="large"
          />
        </div>
        <Button
          type="primary"
          onClick={generateLearningPath}
          loading={loading}
          size="large"
          block
        >
          Generate Learning Path
        </Button>
      </Space>
      {learningPath && (
        <div className="mt-6">
          <LearningPathViewer
            learningPath={learningPath!}
            onSave={() => setLearningPath(null)}
          />
        </div>
      )}
    </Card>
  );
}
