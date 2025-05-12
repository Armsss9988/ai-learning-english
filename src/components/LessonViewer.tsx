import { Card, Space, Typography } from "antd";
import TextFormater from "./TextFormater";
import { Lesson, Question } from "@prisma/client";
import { useMemo, useState } from "react";
import QuestionCard from "./QuestionCard";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useUpdateLessonStatus } from "@/hooks/useLessons";
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
  const handleQuestionPass = (questionId: string) => {
    setPassedQuestion((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.add(questionId);
      return updatedSet;
    });
  };

  return (
    <Card className="!shadow-lg !bg-gray-50">
      <Space direction="vertical" size="large" className="w-full">
        <div className="mt-10 rounded-xl border-4 border-blue-900 py-10 text-4xl text-center font-[900] text-blue-950">
          {lesson.title}
        </div>

        <div className="mt-6">
          <div className="mt-4">{TextFormater(lesson.theory)}</div>
        </div>

        {questions.length > 0 && (
          <div className="mt-6">
            <Title level={3}>Questions</Title>
            <div className="mt-4">
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
            <button
              className={`fixed top-38 right-6  text-white text-md font-bold py-2 px-4 rounded-lg shadow-lg flex items-center justify-center space-x-2 ${
                passedQuestion.size > questions.length * 0.6 ? "bg-blue-400" : "bg-gray-400"
              }`}
              disabled={passedQuestion.size < questions.length * 0.6}
              onClick={() => {
                updateStatus({ lessonId: lesson.id, isCompleted: true });
              }}
            >
              <CheckCircleOutlined className="!text-green-500 text-3xl" />
              <span>Finish Lesson</span>
            </button>
            {/* {passedQuestion.size > questions.length * 0.6 && (
            
            )} */}
          </div>
        )}
      </Space>
    </Card>
  );
}
