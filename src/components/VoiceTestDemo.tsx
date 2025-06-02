import React, { useState } from "react";
import { Card, Button, Space, Typography, Alert, Divider } from "antd";
import { SoundOutlined, AudioOutlined } from "@ant-design/icons";
import VoiceSelector from "./VoiceSelector";
import AudioRecorder from "./AudioRecorder";

const { Title, Text } = Typography;

export const VoiceTestDemo: React.FC = () => {
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any>(null);

  const testTexts = [
    "Hello, my name is Sarah. I am practicing English pronunciation.",
    "The quick brown fox jumps over the lazy dog.",
    "How are you doing today? I hope you're having a wonderful time.",
    "Pronunciation practice is essential for language learning success.",
  ];

  const testVoiceWithText = async (text: string) => {
    if (!selectedVoice) {
      alert("Please select a voice first");
      return;
    }

    setIsPlaying(true);
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  const handleAudioRecord = (blob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const audioData = reader.result as string;
      setAudioUrl(audioData);

      // Simulate audio analysis
      analyzeAudio(audioData);
    };
    reader.readAsDataURL(blob);
  };

  const analyzeAudio = (audioData: string) => {
    // Simulate audio analysis results
    const audioSize = audioData.length;
    const estimatedDuration = Math.max(1, Math.floor(audioSize / 50000));

    let quality: "excellent" | "good" | "fair" | "poor" = "poor";
    if (audioSize > 100000) quality = "excellent";
    else if (audioSize > 50000) quality = "good";
    else if (audioSize > 20000) quality = "fair";

    setTestResults({
      audioSize,
      estimatedDuration,
      quality,
      feedback: generateFeedback(quality, estimatedDuration),
    });
  };

  const generateFeedback = (quality: string, duration: number) => {
    const feedback = [];

    if (duration < 2) {
      feedback.push(
        "Try speaking for a longer duration to get better analysis."
      );
    } else if (duration > 10) {
      feedback.push("Good detailed response length.");
    } else {
      feedback.push("Appropriate response length for practice.");
    }

    switch (quality) {
      case "excellent":
        feedback.push(
          "Excellent audio quality - perfect for pronunciation analysis!"
        );
        break;
      case "good":
        feedback.push(
          "Good audio quality - suitable for most analysis features."
        );
        break;
      case "fair":
        feedback.push(
          "Fair audio quality - consider improving microphone setup."
        );
        break;
      case "poor":
        feedback.push("Poor audio quality - please check microphone settings.");
        break;
    }

    return feedback;
  };

  const handlePlay = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handlePause = () => setIsPlaying(false);
  const handleStop = () => setIsPlaying(false);

  return (
    <div className="space-y-6">
      <Card>
        <Title level={3}>🎤 Voice & Audio Testing Demo</Title>
        <Text type="secondary">
          Test the enhanced voice selection and audio analysis features for
          listening and speaking practice.
        </Text>
      </Card>

      {/* Voice Selection Test */}
      <Card title="🔊 Voice Selection for Listening">
        <VoiceSelector
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
        />

        {selectedVoice && (
          <div className="mt-4">
            <Divider>Test Voice with Sample Texts</Divider>
            <Space direction="vertical" style={{ width: "100%" }}>
              {testTexts.map((text, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <Text className="flex-1">{text}</Text>
                  <Space>
                    <Button
                      icon={<SoundOutlined />}
                      onClick={() => testVoiceWithText(text)}
                      loading={isPlaying}
                      size="small"
                    >
                      Play
                    </Button>
                    <Button
                      icon={<SoundOutlined />}
                      onClick={() => testVoiceWithText(text)}
                      disabled={isPlaying}
                      size="small"
                      className="border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700"
                    >
                      🔄 Speak Again
                    </Button>
                  </Space>
                </div>
              ))}
            </Space>

            <Alert
              message="Speak Again Feature Demo"
              description="The 'Speak Again' button allows users to easily repeat audio content for better comprehension and pronunciation practice. This is especially useful for listening exercises where students may need to hear the content multiple times."
              type="info"
              showIcon
              className="mt-4"
            />
          </div>
        )}
      </Card>

      {/* Audio Recording Test */}
      <Card title="🎙️ Audio Recording & Analysis for Speaking">
        <Alert
          message="Speaking Practice Test"
          description="Record yourself reading one of the sample texts above, and see how the audio analysis works."
          type="info"
          showIcon
          className="mb-4"
        />

        <AudioRecorder
          onRecordingComplete={handleAudioRecord}
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
        />

        {testResults && (
          <div className="mt-4">
            <Divider>Audio Analysis Results</Divider>
            <div className="bg-blue-50 p-4 rounded">
              <Space direction="vertical">
                <Text>
                  <strong>Audio Size:</strong> {testResults.audioSize} bytes
                </Text>
                <Text>
                  <strong>Estimated Duration:</strong> ~
                  {testResults.estimatedDuration} seconds
                </Text>
                <Text>
                  <strong>Quality:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-white ${
                      testResults.quality === "excellent"
                        ? "bg-green-500"
                        : testResults.quality === "good"
                        ? "bg-blue-500"
                        : testResults.quality === "fair"
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                  >
                    {testResults.quality.toUpperCase()}
                  </span>
                </Text>
                <div>
                  <Text strong>Feedback:</Text>
                  <ul className="mt-2">
                    {testResults.feedback.map((item: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Space>
            </div>
          </div>
        )}
      </Card>

      {/* Summary */}
      <Card>
        <Title level={4}>✨ Enhanced Features Summary</Title>
        <Space direction="vertical">
          <Text>
            ✅ <strong>Fixed iOS Voice Issue:</strong> Voice selector forces
            English voices, overriding Vietnamese-accented system voices
          </Text>
          <Text>
            ✅ <strong>Enhanced Audio Analysis:</strong> Speaking exercises now
            include detailed audio quality assessment
          </Text>
          <Text>
            ✅ <strong>Pronunciation Feedback:</strong> AI provides specific
            feedback based on audio analysis
          </Text>
          <Text>
            ✅ <strong>Speak Again Functionality:</strong> Easy repeat button
            for listening practice and re-recording for speaking exercises
          </Text>
          <Text>
            ✅ <strong>User-Friendly Controls:</strong> Easy voice testing and
            selection interface with instant replay options
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default VoiceTestDemo;
