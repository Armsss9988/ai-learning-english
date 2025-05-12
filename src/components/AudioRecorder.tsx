import React, { useState, useRef } from 'react';
import { Button, Space, message } from 'antd';
import { AudioOutlined, PauseOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  audioUrl?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  audioUrl,
  isPlaying,
  onPlay,
  onPause,
  onStop,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch {
      message.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Space>
        {!audioUrl ? (
          <>
            {!isRecording ? (
              <Button
                type="primary"
                icon={<AudioOutlined />}
                onClick={startRecording}
              >
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={stopRecording}
                >
                  Stop Recording
                </Button>
                <span className="text-gray-500">
                  {formatTime(recordingTime)}
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <Button
              type="primary"
              icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
              onClick={isPlaying ? onPause : onPlay}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              icon={<StopOutlined />}
              onClick={onStop}
            >
              Stop
            </Button>
            <audio
              ref={audioRef}
              src={audioUrl}
              onPlay={() => onPlay?.()}
              onPause={() => onPause?.()}
              onEnded={() => onStop?.()}
              style={{ display: 'none' }}
            />
          </>
        )}
      </Space>
    </div>
  );
};

export default AudioRecorder; 