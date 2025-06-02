"use client";

import { Button, Card, Typography, Space, Input, Radio, Alert } from "antd";
import { Question } from "@prisma/client";
import { memo, useCallback, useState, useEffect } from "react";
import MarkdownContent from "./MarkdownContent";
import AudioRecorder from "./AudioRecorder";
import { CheckOutlined, SoundOutlined } from "@ant-design/icons";
import { useEvaluateResponse } from "@/hooks/useLessons";
import { StarDisplay } from "./StarDisplay";
const { Title } = Typography;

interface QuestionCardProps {
  question: Question;
  index: number;
  onPass: () => Promise<void> | void;
  selectedVoice?: SpeechSynthesisVoice | null;
}

// =============================================================================
// ENHANCED VOICE FUNCTIONALITY FOR LISTENING
// =============================================================================

interface EnhancedAudioOptions {
  preferredVoices: string[];
  fallbackLang: string;
  rate: number;
  pitch: number;
}

class EnhancedTextToSpeech {
  private static instance: EnhancedTextToSpeech;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;

  constructor() {
    this.loadVoices();
  }

  static getInstance(): EnhancedTextToSpeech {
    if (!EnhancedTextToSpeech.instance) {
      EnhancedTextToSpeech.instance = new EnhancedTextToSpeech();
    }
    return EnhancedTextToSpeech.instance;
  }

  private loadVoices(): void {
    const updateVoices = () => {
      this.voices = speechSynthesis.getVoices();
      this.voicesLoaded = true;
    };

    updateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  private getEnglishVoice(): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded || this.voices.length === 0) {
      this.loadVoices();
      return null;
    }

    // Priority list for English voices (prefer native English speakers)
    const preferredVoices = [
      "Microsoft Zira - English (United States)",
      "Microsoft David - English (United States)",
      "Google US English",
      "Alex",
      "Samantha",
      "Daniel",
      "Karen",
      "Moira",
      "Tessa",
    ];

    // First try preferred voices by name
    for (const voiceName of preferredVoices) {
      const voice = this.voices.find((v) => v.name === voiceName);
      if (voice) return voice;
    }

    // Then try by language, prioritizing US English
    const englishVoices = this.voices.filter(
      (v) => v.lang.startsWith("en-") && !v.lang.includes("_")
    );

    // Sort by preference: US English first, then others
    englishVoices.sort((a, b) => {
      if (a.lang === "en-US" && b.lang !== "en-US") return -1;
      if (b.lang === "en-US" && a.lang !== "en-US") return 1;
      if (a.default && !b.default) return -1;
      if (b.default && !a.default) return 1;
      return 0;
    });

    return englishVoices[0] || null;
  }

  speak(
    text: string,
    options: Partial<EnhancedAudioOptions> = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        reject(new Error("No text to speak"));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const englishVoice = this.getEnglishVoice();

      if (englishVoice) {
        utterance.voice = englishVoice;
        utterance.lang = englishVoice.lang;
      } else {
        // Fallback to English language setting
        utterance.lang = "en-US";
      }

      // Apply options
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (event) =>
        reject(new Error(`Speech synthesis error: ${event.error}`));

      // iOS Safari compatibility
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, 100);
    });
  }

  getAvailableEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter((v) => v.lang.startsWith("en-"));
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const QuestionCard = memo(
  ({ question, index, onPass, selectedVoice }: QuestionCardProps) => {
    const [userAnswer, setUserAnswer] = useState<string>("");
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string>("");
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [showEvaluation, setShowEvaluation] = useState<boolean>(true);

    const {
      mutate: evalue,
      data: evaluate,
      isPending: isEvaluating,
      reset: resetEvaluate,
    } = useEvaluateResponse();
    const tts = EnhancedTextToSpeech.getInstance();

    useEffect(() => {
      if (question.audioText) {
        // Pre-load voices for better performance
        const voices = speechSynthesis.getVoices();
        if (
          voices.length === 0 &&
          speechSynthesis.onvoiceschanged !== undefined
        ) {
          speechSynthesis.onvoiceschanged = () => {
            console.log("Voices loaded:", speechSynthesis.getVoices().length);
          };
        }
      }
    }, [question.audioText]);

    const handleAnswerChange = useCallback((value: string) => {
      setUserAnswer(value);
    }, []);

    const checkAnswer = useCallback(() => {
      const correct =
        userAnswer.toLowerCase().trim() ===
        question.correctAnswer?.toLowerCase().trim();
      setIsCorrect(correct);
      setShowExplanation(true);
      if (correct) {
        setTimeout(() => onPass(), 1500);
      }
    }, [userAnswer, question.correctAnswer, onPass]);

    const evaluateAnswer = useCallback(() => {
      if (!userAnswer.trim() && !audioUrl) return;

      const data = {
        questionId: question.id,
        questionContent: question.question,
        answer: userAnswer,
        criteria: question.evaluationCriteria || [],
        questionType: question.type,
        audioUrl: audioUrl || undefined,
      };

      setShowEvaluation(true);
      evalue(data);
    }, [
      question.id,
      question.question,
      userAnswer,
      question.evaluationCriteria,
      question.type,
      audioUrl,
      evalue,
    ]);

    // Enhanced audio playback for listening
    const handlePlayAudio = useCallback(async () => {
      if (!question.audioText) return;

      try {
        setIsPlaying(true);
        await tts.speak(question.audioText, {
          rate: 0.8, // Slightly slower for learning
          pitch: 1.0,
        });
      } catch (error) {
        console.error("Audio playback error:", error);
      } finally {
        setIsPlaying(false);
      }
    }, [question.audioText, tts]);

    // Audio recording for speaking questions
    const handleAudioRecord = useCallback(
      (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const audioData = reader.result as string;
          setAudioUrl(audioData);

          // Auto-evaluate with audio data
          const data = {
            questionId: question.id,
            questionContent: question.question,
            answer: userAnswer || "Audio response",
            criteria: question.evaluationCriteria || [],
            questionType: question.type,
            audio: audioData,
          };

          setShowEvaluation(true);
          evalue(data);
        };
        reader.readAsDataURL(blob);
      },
      [
        question.id,
        question.question,
        userAnswer,
        question.evaluationCriteria,
        question.type,
        evalue,
      ]
    );

    const handlePlay = useCallback(() => {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
      }
    }, [audioUrl]);

    const handlePause = useCallback(() => {
      setIsPlaying(false);
    }, []);

    const handleStop = useCallback(() => {
      setIsPlaying(false);
    }, []);

    const resetSpeakingExercise = useCallback(() => {
      setUserAnswer("");
      setAudioUrl("");
      setShowEvaluation(false);
      // Reset evaluation data if the hook supports it
      if (resetEvaluate) {
        resetEvaluate();
      }
      // After a brief delay, allow evaluation to show again
      setTimeout(() => setShowEvaluation(true), 100);
    }, [resetEvaluate]);

    const renderCheckAnswerButton = () => {
      if (isCorrect) return null;
      return (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={checkAnswer}
          className="mt-4"
          disabled={!userAnswer.trim()}
        >
          Check Answer
        </Button>
      );
    };

    const renderExplanation = () => {
      if (!showExplanation) return null;
      return (
        <Alert
          message={isCorrect ? "Correct!" : "Incorrect"}
          description={question.explanation}
          type={isCorrect ? "success" : "error"}
          showIcon
          className="mt-4"
        />
      );
    };

    const renderEvaluate = () => {
      if (!evaluate || !showEvaluation) return null;
      return (
        <div className="flex flex-col gap-1">
          <StarDisplay rating={Math.floor(evaluate.score)} />
          <Alert
            message="Evaluation Results"
            description={
              <div>
                <p>
                  <strong>Score:</strong> {Math.floor(evaluate.score)}/5
                </p>
                <div className="mt-2">
                  <strong>Feedback:</strong>
                  <div className="mt-1">
                    <MarkdownContent content={evaluate.feedback} />
                  </div>
                </div>
                {audioUrl && (
                  <p className="text-blue-600 mt-2">
                    ✓ Audio analysis included in evaluation
                  </p>
                )}
              </div>
            }
            type="info"
            showIcon
            className="mt-4"
          />

          {/* Speak Again Button */}
          {question.type === "speaking" && (
            <Button
              onClick={resetSpeakingExercise}
              className="mt-3"
              type="default"
              size="large"
            >
              🎤 Speak Again
            </Button>
          )}
        </div>
      );
    };

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
                placeholder="Write your essay here..."
              />
              <Button
                onClick={evaluateAnswer}
                loading={isEvaluating}
                className="my-3"
                type="primary"
              >
                Evaluate Essay
              </Button>
              {renderEvaluate()}
            </>
          );
        case "speaking":
          return (
            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Speaking Exercise</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Record your response and get evaluated based on the question
                  criteria.
                </p>

                {/* Audio Recording */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Audio Recording:
                  </label>
                  <AudioRecorder
                    onRecordingComplete={handleAudioRecord}
                    audioUrl={audioUrl}
                    isPlaying={isPlaying}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onStop={handleStop}
                  />
                </div>
              </div>

              {!evaluate && (
                <Button
                  onClick={evaluateAnswer}
                  loading={isEvaluating}
                  className="w-full"
                  type="primary"
                  size="large"
                  disabled={!userAnswer.trim() && !audioUrl}
                >
                  Evaluate Speaking
                </Button>
              )}
              {renderEvaluate()}
            </div>
          );
        case "reading":
          return <MarkdownContent content={question.question} />;
        default:
          return null;
      }
    };

    return (
      <Card className="w-full shadow-lg border-l-4 border-l-emerald-500">
        <div className="space-y-4">
          <Title level={4} className="text-emerald-700">
            Question {index + 1}
          </Title>

          <MarkdownContent content={question.question} />

          {/* Evaluation Criteria Display for Speaking and Essay Questions */}
          {(question.type === "speaking" || question.type === "essay") &&
            question.evaluationCriteria &&
            question.evaluationCriteria.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-l-amber-400 p-4 rounded-r-lg">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                  📋 Evaluation Criteria{" "}
                  {question.type === "speaking" ? "(Speaking)" : "(Writing)"}
                </h4>
                <p className="text-sm text-amber-700 mb-3">
                  Your response will be evaluated based on the following
                  criteria:
                </p>
                <ul className="space-y-1">
                  {question.evaluationCriteria.map((criterion, index) => (
                    <li
                      key={index}
                      className="text-sm text-amber-800 flex items-start"
                    >
                      <span className="text-amber-600 mr-2">•</span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Enhanced Audio Button for Listening */}
          {question.audioText && (
            <div className="my-4">
              <Button
                type="default"
                icon={<SoundOutlined />}
                loading={isPlaying}
                onClick={handlePlayAudio}
                className="rounded-xl border-emerald-300 hover:border-emerald-500 hover:text-emerald-600"
                size="large"
              >
                {isPlaying ? "🔊 Playing..." : "🔊 Play Audio (English)"}
              </Button>
              <div className="text-xs text-gray-500 mt-1">
                Enhanced with native English voice selection
              </div>
            </div>
          )}

          <div className="mt-4">{renderInput()}</div>
        </div>
      </Card>
    );
  }
);

QuestionCard.displayName = "questionCard";
export default QuestionCard;
