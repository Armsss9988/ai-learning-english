import { Card, Space, Typography, Drawer } from "antd";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import TextFormater from "./TextFormater";
import { Lesson, Question } from "@prisma/client";
import { useMemo, useState } from "react";
import QuestionCard from "./QuestionCard";
import { useUpdateLessonStatus } from "@/hooks/useLessons";
import FloatButton from "./FloatButton";
const { Title } = Typography;

export default function LessonViewer({
  lesson,
}: {
  lesson: Lesson & { questions: Question[] };
}) {
  const questions = useMemo(
    () => lesson.questions as Question[],
    [lesson.questions]
  );
  const [passedQuestion, setPassedQuestion] = useState<Set<string>>(new Set());
  const { mutate: updateStatus } = useUpdateLessonStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleQuestionPass = (questionId: string) => {
    setPassedQuestion((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.add(questionId);
      return updatedSet;
    });
  };

  const progressPercentage = (passedQuestion.size / questions.length) * 100;

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-0 md:px-6 py-8">
        {/* Lesson Header */}
        <Card className="!mb-8 !border-0 !shadow-xl !text-center !bg-gradient-to-r !from-emerald-600 !to-amber-600 !rounded-3xl">
          <div className="p-8">
            <Title
              level={1}
              className="!text-white !mb-4 !text-2xl md:!text-4xl"
            >
              {lesson.title}
            </Title>
            {questions.length > 0 && (
              <div className="bg-white/20 rounded-full px-6 py-2 inline-block backdrop-blur-sm">
                <span className="text-white font-semibold">
                  Progress: {passedQuestion.size}/{questions.length} (
                  {Math.round(progressPercentage)}%)
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Lesson Content */}
        <Card
          className="
          border-0 shadow-lg rounded-2xl
         !bg-transparent
          backdrop-blur-sm
        "
        >
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Title level={3} className="!text-stone-800 !mb-4">
                📚 Lesson Content
              </Title>
              <div className="prose max-w-none">
                {TextFormater(lesson.theory)}
              </div>
            </div>

            {questions.length > 0 && (
              <Drawer
                title={
                  <div className="flex items-center gap-3">
                    <QuestionCircleOutlined className="text-emerald-600" />
                    <span>
                      Practice Questions ({passedQuestion.size}/
                      {questions.length})
                    </span>
                  </div>
                }
                placement="top"
                className="max-w-4xl mx-auto"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                height="100vh"
                styles={{
                  body: {
                    background:
                      "linear-gradient(135deg, #ecfdf5 0%, #fffbeb 100%)",
                    padding: "24px",
                  },
                }}
                // footer={
                //   <div className="flex justify-center gap-4 p-4">
                //     <Button
                //       type="default"
                //       shape="circle"
                //       icon={<UpOutlined />}
                //       size="large"
                //       onClick={() => setDrawerOpen(false)}
                //       className="!border-emerald-300 hover:!border-emerald-500"
                //     />
                //     {passedQuestion.size > questions.length * 0.6 && (
                //       <Button
                //         type="primary"
                //         onClick={() => {
                //           updateStatus({
                //             lessonId: lesson.id,
                //             isCompleted: true,
                //           });
                //         }}
                //         className="
                //           !rounded-xl !border-none
                //           bg-gradient-to-r from-emerald-600 to-amber-600
                //           hover:from-emerald-700 hover:to-amber-700
                //           transition-all duration-200
                //         "
                //       >
                //         <CheckCircleOutlined className="mr-2" />
                //         Complete Lesson
                //       </Button>
                //     )}
                //   </div>
                // }
              >
                <div className="space-y-6">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="relative">
                      <div className="absolute -top-2 -right-2 z-10">
                        {passedQuestion.has(q.id) ? (
                          <CheckCircleFilled className="!text-emerald-600 !text-3xl drop-shadow-sm" />
                        ) : (
                          <QuestionCircleOutlined className="!text-stone-400 !text-2xl" />
                        )}
                      </div>
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={idx}
                        onPass={() => handleQuestionPass(q.id)}
                      />
                    </div>
                  ))}
                </div>
                <FloatButton
                  onClick={() => {
                    updateStatus({ lessonId: lesson.id, isCompleted: true });
                  }}
                  bottom={100}
                  centered={true}
                  variant={progressPercentage > 60 ? "success" : "secondary"}
                  title={
                    progressPercentage <= 60
                      ? `Let's try for complete lession (${Math.floor(
                          progressPercentage
                        )}%)`
                      : "Finish"
                  }
                  icon={
                    progressPercentage > 60 ? (
                      <CheckCircleOutlined />
                    ) : (
                      <QuestionCircleOutlined />
                    )
                  }
                />
              </Drawer>
            )}
          </Space>
        </Card>
      </div>

      {/* Fixed Floating Buttons - positioned relative to screen */}
      {questions.length > 0 && (
        <>
          <FloatButton
            onClick={() => setDrawerOpen(true)}
            bottom={100}
            centered={true}
            variant={progressPercentage > 60 ? "success" : "primary"}
            title="Questions"
            icon={<QuestionCircleOutlined />}
          />
        </>
      )}
    </div>
  );
}
