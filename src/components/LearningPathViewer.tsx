"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Button,
  message,
  Skeleton,
  Modal,
  Input,
  Card,
  Spin,
  Typography,
} from "antd";
import { LearningPath, Lesson } from "@prisma/client";
import {
  useLessonsByLearningPath,
  useSaveLesson,
  useGenerateLesson,
} from "@/hooks/useLessons";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useSaveLearningPath } from "@/hooks/useLearningPath";
import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface LearningPathViewerProps {
  learningPath: LearningPath;
  onSave?: () => Promise<void> | void;
}

export default function LearningPathViewer({
  learningPath,
  onSave,
}: LearningPathViewerProps) {
  const { isAuthenticated } = useAuth();
  const { data: lessons = [], isLoading: isLessonsLoading } =
    useLessonsByLearningPath(learningPath.id || "");
  const { mutate: saveLesson } = useSaveLesson(learningPath.id);
  const { mutate: generateLesson } = useGenerateLesson();
  const router = useRouter();
  const { mutate: saveLearningPath } = useSaveLearningPath();
  const [savingLearningPath] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState<number | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState(learningPath.title);
  const [editedDescription, setEditedDescription] = useState<string>(
    learningPath.description || ""
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    saveLearningPath(
      {
        ...learningPath,
        title: editedTitle,
        description: editedDescription,
      },
      { onSuccess: () => onSave && onSave() }
    );
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const savedTopics = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      acc[lesson.lessonNumber] = lesson;
      return acc;
    }, {} as Record<number, Lesson>);
  }, [lessons]);

  const handleTopicClick = useCallback(
    async (lessonNumber: number, topic: string) => {
      if (!learningPath.id) {
        message.warning("Please save the learning path first");
        return;
      }

      const existingLesson = savedTopics[lessonNumber];
      if (existingLesson) {
        router.push(
          `/learning-paths/${learningPath.id}/lesson/${existingLesson.id}`
        );
        return;
      }

      setLoadingLesson(lessonNumber);
      generateLesson(topic, {
        onSuccess: (newLesson) => {
          newLesson.lessonNumber = lessonNumber;
          saveLesson(newLesson, {
            onSuccess: (savedLesson) => {
              router.push(
                `/learning-paths/${learningPath.id}/lesson/${savedLesson.id}`
              );
            },
          });
        },
        onError: (error) => {
          console.error("Error generating lesson:", error);
          message.error("Failed to generate lesson");
        },
        onSettled: () => {
          setLoadingLesson(null);
        },
      });
    },
    [learningPath.id, savedTopics, generateLesson, saveLesson, router]
  );

  const renderTopic = useCallback(
    (topic: string, index: number) => {
      const lessonNumber = index + 1;
      const isSaved = savedTopics[lessonNumber];
      const isLoading = loadingLesson === lessonNumber;
      const isCompleted = isSaved?.isCompleted;

      return (
        <Card
          key={index}
          hoverable
          className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl hover:scale-105"
          onClick={() => handleTopicClick(lessonNumber, topic)}
          style={{
            borderRadius: "16px",
            background: isCompleted
              ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
              : isSaved
              ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            border: isCompleted
              ? "2px solid #10b981"
              : isSaved
              ? "2px solid #f59e0b"
              : "2px solid #e5e7eb",
          }}
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircleOutlined className="text-emerald-600 text-lg" />
                ) : isSaved ? (
                  <PlayCircleOutlined className="text-amber-600 text-lg" />
                ) : (
                  <BookOutlined className="text-stone-400 text-lg" />
                )}
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
                  Lesson {lessonNumber}
                </span>
              </div>
              {isLoading && <Spin size="small" />}
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-stone-800 text-sm leading-tight">
                {topic.split("-")[0].split(":")[0]}
              </h4>
              <p className="font-semibold text-emerald-700">
                {topic.split("-")[0].split(":")[1]}
              </p>
              <p className="text-xs text-stone-600 italic">
                {topic.split("-")[1]}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-medium ${
                    isCompleted
                      ? "text-emerald-600"
                      : isSaved
                      ? "text-amber-600"
                      : "text-stone-500"
                  }`}
                >
                  {isCompleted
                    ? "Completed"
                    : isSaved
                    ? "In Progress"
                    : "Not Started"}
                </span>
                {isSaved && (
                  <span className="text-stone-400">
                    <ClockCircleOutlined className="mr-1" />
                    Click to continue
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      );
    },
    [savedTopics, handleTopicClick, loadingLesson]
  );

  if (isLessonsLoading) {
    return <Skeleton active paragraph={{ rows: 20 }} />;
  }

  return (
    <div className="space-y-8">
      <Modal
        title="Edit Learning Path"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        className="rounded-lg"
      >
        <div className="space-y-4">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Enter title"
            size="large"
          />
          <Input.TextArea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Enter description"
            rows={4}
            size="large"
          />
        </div>
      </Modal>

      {/* Hero Section */}
      <Card
        className="border-0 shadow-xl"
        style={{
          borderRadius: "24px",
          background: "linear-gradient(135deg, #059669 0%, #d97706 100%)",
          color: "white",
        }}
      >
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <Title
                level={1}
                className="!text-white !mb-4 !text-2xl md:!text-4xl"
              >
                {learningPath.title}
              </Title>
              <Text className="!text-emerald-100 text-lg">
                {learningPath.description}
              </Text>

              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <Text className="!text-white font-semibold">
                    📚 {learningPath.totalLessons} Lessons
                  </Text>
                </div>
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <Text className="!text-white font-semibold">
                    ⏱️ {learningPath.estimatedTime}
                  </Text>
                </div>
              </div>
            </div>

            {isAuthenticated && !learningPath.id && (
              <Button
                size="large"
                onClick={showModal}
                loading={savingLearningPath}
                className="!bg-white !text-emerald-700 !border-none !rounded-full !px-8 !py-6 !h-auto hover:!bg-amber-50"
              >
                Save Learning Path
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Topics Section */}
      <div>
        <Title
          level={2}
          className="!text-stone-800 !mb-6 flex items-center gap-3"
        >
          <BookOutlined className="text-emerald-600" />
          Learning Topics
        </Title>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {learningPath.topics.map((topic, index) => renderTopic(topic, index))}
        </div>
      </div>

      {/* Key Skills Section */}
      <div>
        <Title level={2} className="!text-stone-800 !mb-6">
          🎯 Key Skills You&apos;ll Master
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {learningPath.keySkills.map((skill, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-xl px-4 py-3 text-center hover:shadow-md transition-all duration-300"
            >
              <Text className="!text-stone-700 font-medium">{skill}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
