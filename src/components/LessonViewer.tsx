import { Card, Space, Typography, Drawer, Button } from "antd";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  DownOutlined,
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

  return (
    <div>
      <div className="mx-3 md:mx-10 my-10 bg-[#a19fb7] rounded-xl border-4 border-blue-900 py-10 text-2xl md:text-4xl text-center font-[900] text-blue-950">
        {lesson.title}
      </div>
      <div className="container mx-auto ">
        <Card className="!shadow-lg !shadow-blue-900/40 !bg-[#c1d7c3] !rounded-lg !border-0 !my-10">
          <Space direction="vertical" size="large" className="w-full">
            <div className="mt-6">
              <div className="mt-4">{TextFormater(lesson.theory)}</div>
            </div>

            {questions.length > 0 && (
              <>
                <FloatButton
                  bottom={28}
                  right={6}
                  onClick={() => {
                    setDrawerOpen(true);
                  }}
                  className={`${
                    passedQuestion.size > questions.length * 0.6
                      ? "bg-blue-400/50"
                      : "bg-green-700/50"
                  }`}
                  title="Questions"
                  icon={
                    <QuestionCircleOutlined className="!text-green-500/70 text-3xl" />
                  }
                />
                <Drawer
                  title="Questions"
                  placement="top"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  height="100vh"
                  footer={
                    <div className="flex justify-center">
                      <Button
                        type="default"
                        shape="circle"
                        icon={<DownOutlined />}
                        size="large"
                        onClick={() => setDrawerOpen(false)}
                      />
                    </div>
                  }
                >
                  <Title level={3}>Questions</Title>
                  <div className="mt-4 container mx-auto">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="flex flex-col">
                        {passedQuestion.has(q.id) ? (
                          <CheckCircleFilled className="!text-green-600 !text-[30px] self-end" />
                        ) : (
                          <CloseOutlined className="!text-red-600 !text-[30px] self-end" />
                        )}

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
                    className={`${
                      passedQuestion.size > questions.length * 0.6
                        ? "!bg-blue-400/90"
                        : "!bg-gray-400/70"
                    }`}
                    onClick={() => {
                      updateStatus({ lessonId: lesson.id, isCompleted: true });
                    }}
                    title="Finish Lesson"
                    top={38}
                    right={6}
                    icon={
                      <CheckCircleOutlined className="!text-green-500/70 text-3xl" />
                    }
                  />
                </Drawer>
              </>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
}
