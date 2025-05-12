import React from "react";
import LessonViewer from "@/components/LessonViewer";
import { useLesson } from "@/hooks/useLessons";
import { useRouter } from "next/router";
import { Lesson, Question } from "@prisma/client";

const LessonPage = () => {
  const router = useRouter();
  const { lessonId } = router.query;
  const { data } = useLesson(lessonId as string);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      {data && (
        <LessonViewer
          lesson={{
            ...data,
            questions: data.question,
          } as Lesson & { questions: Question[] }}
        />
      )}
    </div>
  );
};

export default LessonPage;
