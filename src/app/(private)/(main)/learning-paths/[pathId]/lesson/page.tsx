"use client";
import React from "react";
import LessonViewer from "@/components/LessonViewer";
import { useLesson } from "@/hooks/useLessons";
import { useSearchParams } from "next/navigation";
import { Lesson, Question } from "@prisma/client";

const LessonPage = () => {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const { data } = useLesson(lessonId as string);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <LessonViewer
      lesson={
        {
          ...data,
          questions: data.question,
        } as Lesson & { questions: Question[] }
      }
    />
  );
};

export default LessonPage;
