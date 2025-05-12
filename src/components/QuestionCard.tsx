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
        className="mt-4"
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
        type="info"
        showIcon
        className={`!mt-4 ${isCorrect ? "!bg-green-300" : "!bg-red-200"}`}
      />
    );
  };

  return (
    <Card className="!mb-4 !bg-blue-100">
      <Title level={4}>Question {index + 1}</Title>
      <Title level={5}>{question.question}</Title>

      {question.evaluationCriteria?.length > 0 && (
        <Card title="Criteria" className="!my-4 !bg-blue-50">
          {question.evaluationCriteria.map((crit) => (
            <Typography key={crit} className="!font-bold !text-blue-900">
              {crit}
            </Typography>
          ))}
        </Card>
      )}

      {question.audioText && (
        <Button
          type="dashed"
          icon={<SoundOutlined />}
          onClick={() => {
            const utterance = new SpeechSynthesisUtterance(question.audioText!);
            window.speechSynthesis.speak(utterance);
          }}
          className="mb-4"
        >
          Play Audio
        </Button>
      )}

      {renderInput()}
    </Card>
  );
});
QuestionCard.displayName = "questionCard";
export default QuestionCard;
