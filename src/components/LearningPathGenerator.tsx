import { useState } from 'react';
import { Button, Input, Card, Typography, Space, message } from 'antd';
import { LearningPath } from '@prisma/client';

const { Text } = Typography;

interface LearningPathGeneratorProps {
  onLearningPathGenerated: (learningPath: LearningPath) => void;
}

export default function LearningPathGenerator({ onLearningPathGenerated }: LearningPathGeneratorProps) {
  const [startLevel, setStartLevel] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLearningPath = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startLevel, targetLevel }),
      });
      const data = await response.json();
      onLearningPathGenerated(data);
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to generate learning path');
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
            value={startLevel}
            onChange={(e) => setStartLevel(e.target.value)}
            placeholder="e.g., 5.0"
            size="large"
          />
        </div>
        <div>
          <Text strong>Target IELTS Level</Text>
          <Input
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
    </Card>
  );
} 