"use client";

import { useParams } from "next/navigation";
import LessonViewer from "@/components/LessonViewer";
import { useLesson } from "@/hooks/useLessons";
import { Skeleton, message } from "antd";

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const { data: lesson, isLoading, error } = useLesson(lessonId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Skeleton active paragraph={{ rows: 20 }} title={true} />
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

  return <LessonViewer lesson={lesson} />;
}
