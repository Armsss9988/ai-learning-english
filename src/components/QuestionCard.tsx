"use client";

import { Button, Card, Typography, Space, Input, Radio, Alert } from "antd";
import { Question } from "@prisma/client";
import { memo, useCallback, useState } from "react";
import MarkdownContent from "./MarkdownContent";
// import AudioRecorder from "./AudioRecorder";
import { CheckOutlined, SoundOutlined } from "@ant-design/icons";
// import OrderingQuestion from "./OrderingQuestion";
// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
import { useEvaluateResponse } from "@/hooks/useLessons";
import { StarDisplay } from "./StarDisplay";
import SpeechToText from "./SpeechToText";
const { Title } = Typography;
interface QuestionCardProps {
  question: Question;
  index: number;
  onPass: () => Promise<void> | void;
}

const QuestionCard = memo(({ question, index, onPass }: QuestionCardProps) => {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);
  const [evaluate, setEvaluate] = useState<{
    score: number;
    feedback: string;
  } | null>();
  const { mutate: evalue } = useEvaluateResponse();
  //   const debouncedSetAnswer = useMemo(
  //     () =>
  //       debounce((value: string) => {
  //         setUserAnswer(value);
  //       }, 0),
  //     []
  //   );

  //   useEffect(() => {
  //     return () => debouncedSetAnswer.cancel();
  //   }, [debouncedSetAnswer]);

  const handleAnswerChange = useCallback(
    (value: string) => {
      setUserAnswer(value);
    },
    [setUserAnswer]
  );

  const checkAnswer = useCallback(() => {
    console.log("userAnswer", userAnswer);
    console.log(question.correctAnswer);

    const correct = userAnswer.trim() === (question.correctAnswer || "").trim();
    setIsCorrect(correct);
    if (correct) onPass();
    console.log(correct);
  }, [userAnswer, question.correctAnswer, onPass]);

  const evaluateAnswer = useCallback(() => {
    const data = {
      questionId: question.id,
      answer: userAnswer,
      criteria: question.evaluationCriteria,
      questionType: question.type,
    };
    evalue(data, {
      onSuccess: (data) => {
        setEvaluate(data);
        if (data.score >= 3) {
          onPass();
        }
      },
    });
  }, [
    evalue,
    question.evaluationCriteria,
    question.id,
    question.type,
    userAnswer,
    onPass,
  ]);
  //   const handleAudioRecord = (blob: Blob) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const data = {
  //         questionId: question.id,
  //         audio: reader.result as string,
  //         criteria: question.evaluationCriteria,
  //         questionType: question.type,
  //       };
  //       evalue(data, { onSuccess: (data) => setEvaluate(data) });
  //     };
  //     reader.readAsDataURL(blob);
  //   };
  const renderInput = () => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <>
            <Radio.Group
              className="w-full mt-4"
              onChange={(e) => handleAnswerChange(e.target.value)}
              value={userAnswer}
              disabled={isCorrect}
            >
              <Space direction="vertical" className="w-full">
                {Object.entries(question.options!).map(([key, value]) => (
                  <Radio key={key} value={key}>
                    {value}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
            {renderCheckAnswerButton()}
            {renderExplanation()}
          </>
        );
      case "fill_blank":
        return (
          <>
            <Input
              placeholder="Type your answer here"
              size="large"
              className="mt-4"
              defaultValue={userAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={isCorrect}
            />
            {renderCheckAnswerButton()}
            {renderExplanation()}
          </>
        );
      case "essay":
        return (
          <>
            <Input.TextArea
              rows={6}
              className="mt-4"
              value={userAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
            <Button onClick={evaluateAnswer} title="Evaluate" className="!my-3">
              Evaluate
            </Button>
            {renderEvaluate()}
          </>
        );
      case "speaking":
        return (
          <div className="mt-4">
            {/* <AudioRecorder
              onRecordingComplete={(blob) => handleAudioRecord(blob)}
            /> */}
            <SpeechToText onRes={setUserAnswer} />
            <Button onClick={evaluateAnswer} title="Evaluate" className="!my-3">
              Evaluate
            </Button>
            {renderEvaluate()}
          </div>
        );
      case "reading":
        return <MarkdownContent content={question.question} />;
      // case "ordering":
      //   return (
      //     <DndProvider backend={HTML5Backend}>
      //       <OrderingQuestion question={question} />
      //     </DndProvider>
      //   );
      default:
        return null;
    }
  };
  const renderEvaluate = () => {
    if (!evaluate) return null;
    return (
      <div className="flex flex-col gap-1">
        <StarDisplay rating={evaluate.score} />
        <Alert
          message="Evaluate"
          description={evaluate.feedback}
          type="info"
          showIcon
          className={`!mt-4`}
        />
      </div>
    );
  };

  const renderCheckAnswerButton = () => {
    if (!question.correctAnswer) return null;
    return (
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={checkAnswer}
        disabled={!!isCorrect}
        className="mt-4 !rounded-xl"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #d97706 100%)",
          border: "none",
        }}
      >
        Check Answer
      </Button>
    );
  };

  const renderExplanation = () => {
    if (isCorrect == undefined || !question.explanation) return null;
    return (
      <Alert
        message="Explanation"
        description={question.explanation}
        type={isCorrect ? "success" : "error"}
        showIcon
        className="!mt-4 !rounded-xl"
        style={{
          backgroundColor: isCorrect ? "#d1fae5" : "#fef2f2",
          borderColor: isCorrect ? "#10b981" : "#ef4444",
        }}
      />
    );
  };

  return (
    <Card
      className="!mb-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        borderRadius: "20px",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(236, 253, 245, 0.8) 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="p-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{index + 1}</span>
          </div>
          <Title level={4} className="!text-stone-800 !mb-0">
            Question {index + 1}
          </Title>
        </div>

        <div className="bg-white/70 rounded-xl p-4 mb-4 border border-emerald-100">
          <Title level={5} className="!text-stone-700 !mb-3">
            {question.question}
          </Title>
        </div>

        {question.evaluationCriteria?.length > 0 && (
          <Card
            title={
              <span className="text-emerald-700 font-semibold">
                📋 Evaluation Criteria
              </span>
            }
            className="!my-4 border-0 shadow-sm"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            }}
          >
            <div className="space-y-2">
              {question.evaluationCriteria.map((crit) => (
                <div key={crit} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  <Typography className="!font-medium !text-stone-700">
                    {crit}
                  </Typography>
                </div>
              ))}
            </div>
          </Card>
        )}

        {question.audioText && (
          <Button
            type="default"
            icon={<SoundOutlined />}
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(
                question.audioText!
              );
              window.speechSynthesis.speak(utterance);
            }}
            className="mb-4 !rounded-xl !border-emerald-300 hover:!border-emerald-500 hover:!text-emerald-600"
          >
            🔊 Play Audio
          </Button>
        )}

        <div className="mt-4">{renderInput()}</div>
      </div>
    </Card>
  );
});
QuestionCard.displayName = "questionCard";
export default QuestionCard;
