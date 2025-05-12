"use client";

import { useState } from "react";
import { Button, Drawer, Steps, Skeleton } from "antd";
import { useParams } from "next/navigation";
import LearningPathViewer from "@/components/LearningPathViewer";
import { useLearningPath } from "@/hooks/useLearningPath";

export default function LearningPathDetailPage() {
  const params = useParams();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { data: learningPath, isLoading } = useLearningPath(
    params.pathId as string
  );
  // const { mutate: saveLearningPath, isPending: savingLearningPath } =
  //   useSaveLearningPath();


  // const handleSaveLearningPath = async () => {
  //   if (!learningPath) return;

  //   saveLearningPath(learningPath, {
  //     onSuccess: () => {
  //       message.success("Learning path saved successfully");
  //     },
  //     onError: (error: Error) => {
  //       console.error("Save learning path error:", error);
  //       message.error("Failed to save learning path");
  //     },
  //   });
  // };

  const handleLessonClick = (lessonNumber: number) => {
    if (learningPath && lessonNumber <= learningPath.totalLessons) {
      setDrawerVisible(false);
    }
  };

  if (isLoading) return <Skeleton active />;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="p-10 mx-auto">
        <LearningPathViewer
          learningPath={learningPath!}
        />

        <Drawer
          title="Lesson Navigator"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={400}
        >
          <Steps
            direction="vertical"
            items={
              learningPath?.topics.map((topic, index) => ({
                title: `Lesson ${index + 1}`,
                description: (
                  <div className="flex flex-col">
                    <span>{topic}</span>
                    <Button
                      type="link"
                      className="p-0 mt-1"
                      onClick={() => handleLessonClick(index + 1)}
                    >
                      Go to lesson
                    </Button>
                  </div>
                ),
              })) || []
            }
          />
        </Drawer>
      </div>
    </main>
  );
}
