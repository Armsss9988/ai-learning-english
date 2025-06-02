"use client";

import { useState, useEffect } from "react";
import { Button, Card, Progress, Spin, Typography, Space } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useLesson } from "@/hooks/useLessons";
import { useChatbot } from "@/hooks/useChatbot";
import QuestionCard from "@/components/QuestionCard";
import MarkdownContent from "@/components/MarkdownContent";
import VoiceSelector from "@/components/VoiceSelector";
import { Question } from "@prisma/client";
import { use } from "react";
const { Title } = Typography;

type Params = Promise<{ id: string }>;

export default function LessonDetailPage({ params }: { params: Params }) {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const { data: lesson, isLoading } = useLesson(lessonId || "");
  const { setLessonContext } = useChatbot();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const paramsData = use(params);
  setLessonId(paramsData.id);

  const hasAudioQuestions =
    lesson?.questions?.some((q: Question) => q.audioText) || false;

  // Set lesson context when lesson is loaded
  useEffect(() => {
    if (lesson?.id) {
      console.log(`🎯 Setting lesson context for lesson: ${lesson.id}`);
      setLessonContext(lesson.id);
    }

    // Cleanup when leaving lesson
    return () => {
      setLessonContext(null);
    };
  }, [lesson?.id, setLessonContext]);

  const handleNextQuestion = () => {
    if (lesson?.questions && currentQuestionIndex < lesson.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Title level={3}>Lesson not found</Title>
          <Button type="primary" href="/lessons">
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Voice Settings */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Title level={2} className="text-emerald-800 mb-2">
                {lesson.title}
              </Title>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Question {currentQuestionIndex + 1} of{" "}
                  {lesson.questions?.length || 0}
                </span>
                {hasAudioQuestions && (
                  <Button
                    icon={<SettingOutlined />}
                    size="small"
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    type={showVoiceSettings ? "primary" : "default"}
                  >
                    Voice Settings
                  </Button>
                )}
              </div>
            </div>
            <Progress
              type="circle"
              percent={Math.round(
                ((currentQuestionIndex + 1) / (lesson.questions?.length || 1)) *
                  100
              )}
              size={80}
              className="text-emerald-600"
            />
          </div>

          {/* Voice Settings Panel */}
          {hasAudioQuestions && showVoiceSettings && (
            <Card className="mb-4 border-blue-200 bg-blue-50/50">
              <VoiceSelector
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
              />
            </Card>
          )}
        </div>

        {/* Theory Section */}
        {currentQuestionIndex === 0 && lesson.theory && (
          <Card className="mb-6 shadow-lg border-l-4 border-l-amber-500">
            <Title level={3} className="text-amber-700 mb-4">
              📚 Theory
            </Title>
            <MarkdownContent content={lesson.theory} />
            <div className="mt-6 text-center">
              <Button
                type="primary"
                size="large"
                onClick={() => setCurrentQuestionIndex(1)}
                className="bg-gradient-to-r from-amber-600 to-emerald-600 border-none px-8"
              >
                Start Practice Questions →
              </Button>
            </div>
          </Card>
        )}

        {/* Questions */}
        {currentQuestionIndex > 0 &&
          lesson.questions &&
          lesson.questions.length > 0 && (
            <QuestionCard
              question={lesson.questions[currentQuestionIndex - 1]}
              index={currentQuestionIndex - 1}
              onPass={handleNextQuestion}
              selectedVoice={selectedVoice}
            />
          )}

        {/* Navigation */}
        {currentQuestionIndex > 0 && (
          <Card className="mt-6 bg-white/80">
            <div className="flex justify-between items-center">
              <Button
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                }
                disabled={currentQuestionIndex <= 1}
                icon={<ArrowLeftOutlined />}
              >
                Previous
              </Button>

              <span className="text-gray-600">
                Question {currentQuestionIndex} of {lesson.questions.length}
              </span>

              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex >= lesson.questions.length}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                {currentQuestionIndex >= lesson.questions.length
                  ? "Complete"
                  : "Next"}
              </Button>
            </div>
          </Card>
        )}

        {/* Completion */}
        {currentQuestionIndex > lesson.questions.length && (
          <Card className="text-center shadow-lg border-l-4 border-l-emerald-500">
            <div className="py-8">
              <div className="text-6xl mb-4">🎉</div>
              <Title level={2} className="text-emerald-700">
                Lesson Completed!
              </Title>
              <p className="text-gray-600 mb-6">
                Congratulations! You&apos;ve successfully completed this lesson.
              </p>
              <Space>
                <Button type="primary" size="large" href="/lessons">
                  Back to Lessons
                </Button>
                <Button size="large" onClick={() => setCurrentQuestionIndex(0)}>
                  Review Lesson
                </Button>
              </Space>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
