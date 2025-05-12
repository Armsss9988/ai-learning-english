"use client";

import { useParams } from "next/navigation";
import LessonViewer from "@/components/LessonViewer";
import { useLesson } from "@/hooks/useLessons";
import { Spin, message } from "antd";

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const { data: lesson, isLoading, error } = useLesson(lessonId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    message.error("Failed to load lesson");
    return null;
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LessonViewer lesson={lesson} />
    </div>
  );
}
