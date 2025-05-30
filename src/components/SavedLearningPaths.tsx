import { Typography, Card } from "antd";
import { LearningPath } from "@prisma/client";
import { BookOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

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
    <div className="mt-8 animate-slide-in-up">
      {/* Header Section */}
      <div className="mb-6">
        <Card
          className="border-0 shadow-lg"
          style={{
            borderRadius: "20px",
            background: "linear-gradient(135deg, #059669 0%, #d97706 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-3 py-2">
            <BookOutlined className="text-white text-2xl" />
            <Title level={3} className="!text-white !mb-0">
              Saved Learning Paths
            </Title>
          </div>
        </Card>
      </div>

      {/* Learning Paths List */}
      <div className="space-y-4">
        {learningPaths.map((path) => {
          const isSelected = currentLearningPathId === path.id;

          return (
            <Card
              key={path.id}
              className={`border-0 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                isSelected ? "ring-2 ring-emerald-500" : ""
              }`}
              style={{
                borderRadius: "16px",
                background: isSelected
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(236, 253, 245, 0.8) 100%)",
                backdropFilter: "blur(10px)",
              }}
              onClick={() => onLearningPathClick(path)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected
                          ? "bg-emerald-500 text-white"
                          : "bg-stone-100 text-emerald-600"
                      }`}
                    >
                      <BookOutlined className="text-lg" />
                    </div>
                    <div>
                      <Title
                        level={5}
                        className={`!mb-1 ${
                          isSelected ? "!text-emerald-700" : "!text-stone-800"
                        }`}
                      >
                        {path.title}
                      </Title>
                      {isSelected && (
                        <div className="flex items-center gap-1">
                          <CheckCircleOutlined className="text-emerald-500 text-sm" />
                          <Text className="text-emerald-600 text-xs font-medium">
                            Currently Active
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  <Text className="text-stone-600 text-sm leading-relaxed">
                    {path.description}
                  </Text>

                  {/* Additional metadata */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-200">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <Text className="text-stone-500 text-xs">IELTS Prep</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <Text className="text-stone-500 text-xs">
                        {new Date(path.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="ml-4">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircleOutlined className="text-white text-lg" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-6 text-center">
        <Text className="text-stone-500 text-sm">
          Click on any learning path to switch and continue your progress
        </Text>
      </div>
    </div>
  );
}
