"use client";

import { useState, useMemo, useCallback } from "react";
import { Button, message, Skeleton, Modal, Input, Card, Spin } from "antd";
import { LearningPath, Lesson } from "@prisma/client";
import {
  useLessonsByLearningPath,
  useSaveLesson,
  useGenerateLesson,
} from "@/hooks/useLessons";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useSaveLearningPath } from "@/hooks/useLearningPath";

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

      return (
        <Card
          key={index}
          hoverable
          className={`w-full md:w-[calc(25%-12px)] transition-all duration-300 !text-blue-900  shadow-lg ${
            isSaved
              ? savedTopics[lessonNumber].isCompleted
                ? " !shadow-green-600  !bg-gradient-to-tl !from-green-400 !to-gray-50"
                : " !shadow-gray-600  !bg-gradient-to-tl !from-gray-400 !to-gray-50"
              : "!shadow-gray-400"
          }`}
          onClick={() => handleTopicClick(lessonNumber, topic)}
          title={topic.split("-")[0].split(":")[0]}
        >
          <div className="font-bold text-blue-700">
            {topic.split("-")[0].split(":")[1]}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-[900] text-sm italic ml-3">
              {topic.split("-")[1]}
            </div>
            {isLoading && <Spin size="small" />}
          </div>
        </Card>
      );
    },
    [savedTopics, handleTopicClick, loadingLesson]
  );

  if (isLessonsLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <div className="space-y-6">
      <Modal
        title="Edit Learning Path"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Enter title"
          className="mb-4"
        />
        <Input.TextArea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Enter description"
          rows={4}
        />
      </Modal>

      <div className="flex justify-between items-center p-10 rounded-2xl shadow-lg shadow-black !bg-gradient-to-tl !from-blue-900 !to-gray-400">
        <div>
          <h1 className="text-3xl font-[800]">{learningPath.title}</h1>
          <p className="text-gray-100">{learningPath.description}</p>
        </div>
        {isAuthenticated && !learningPath.id && (
          <Button
            type="primary"
            onClick={showModal}
            loading={savingLearningPath}
          >
            Save Learning Path
          </Button>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Topics</h2>
        <div className="flex flex-wrap gap-3">
          {learningPath.topics.map((topic, index) => renderTopic(topic, index))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Key Skills</h2>
        <div className="flex flex-wrap gap-2">
          {learningPath.keySkills.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="text-gray-600">
        <p>Total Lessons: {learningPath.totalLessons}</p>
        <p>Estimated Time: {learningPath.estimatedTime}</p>
      </div>
    </div>
  );
}
