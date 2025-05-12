import { List, Typography } from "antd";
import { LearningPath } from "@prisma/client";

const { Title } = Typography;

interface SavedLearningPathsProps {
  learningPaths: LearningPath[];
  onLearningPathClick: (path: LearningPath) => void;
  currentLearningPathId: string;
}

export default function SavedLearningPaths({
  learningPaths,
  currentLearningPathId,
  onLearningPathClick,
}: SavedLearningPathsProps) {
  if (learningPaths.length === 0) return null;

  return (
    <div className="mt-8">
      <Title level={3}>Saved Learning Paths</Title>
      <List
        dataSource={learningPaths}
        renderItem={(path) => (
          <List.Item
            className={`cursor-pointer !p-4 rounded ${
              currentLearningPathId == path.id ? "bg-green-500 hover:bg-green-300":"hover:bg-gray-50"
            }`}
            onClick={() => onLearningPathClick(path)}
          >
            <List.Item.Meta title={path.title} description={path.description} />
          </List.Item>
        )}
      />
    </div>
  );
}
