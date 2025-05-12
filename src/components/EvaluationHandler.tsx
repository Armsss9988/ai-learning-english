
import { Modal, Typography, Progress, Space, Button } from 'antd';


const { Title, Text } = Typography;

interface EvaluationHandlerProps {
  visible: boolean;
  onClose: () => void;
  evaluation: {
    score: number;
    feedback: string;
  } | null;
}

export default function EvaluationHandler({
  visible,
  onClose,
  evaluation
}: EvaluationHandlerProps) {
  if (!evaluation) return null;

  return (
    <Modal
      title="Evaluation Results"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Title level={4}>Score</Title>
          <Progress
            type="circle"
            percent={evaluation.score}
            format={(percent) => `${percent}%`}
          />
        </div>

        <div>
          <Title level={4}>Feedback</Title>
          <Text>{evaluation.feedback}</Text>
        </div>
      </Space>
    </Modal>
  );
} 