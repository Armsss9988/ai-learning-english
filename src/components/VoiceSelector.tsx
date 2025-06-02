import React, { useState, useEffect } from "react";
import { Select, Button, Space, Tooltip, Alert } from "antd";
import { SoundOutlined, SettingOutlined } from "@ant-design/icons";

interface VoiceSelectorProps {
  onVoiceChange?: (voice: SpeechSynthesisVoice | null) => void;
  selectedVoice?: SpeechSynthesisVoice | null;
  className?: string;
}

interface VoiceOption {
  value: string;
  label: string;
  voice: SpeechSynthesisVoice;
  isRecommended?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  onVoiceChange,
  selectedVoice,
  className = "",
}) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();

      // Filter English voices and create options
      const englishVoices = allVoices
        .filter((voice) => voice.lang.startsWith("en-"))
        .map((voice) => {
          const isRecommended = isRecommendedVoice(voice);
          return {
            value: `${voice.name}-${voice.lang}`,
            label: `${voice.name} (${voice.lang})${isRecommended ? " ⭐" : ""}`,
            voice,
            isRecommended,
          };
        })
        .sort((a, b) => {
          // Sort recommended voices first, then by language preference
          if (a.isRecommended && !b.isRecommended) return -1;
          if (!a.isRecommended && b.isRecommended) return 1;
          if (a.voice.lang === "en-US" && b.voice.lang !== "en-US") return -1;
          if (a.voice.lang !== "en-US" && b.voice.lang === "en-US") return 1;
          return a.voice.name.localeCompare(b.voice.name);
        });

      setVoices(englishVoices);

      // Auto-select the best voice if none selected
      if (!selectedVoice && englishVoices.length > 0) {
        const recommendedVoice =
          englishVoices.find((v) => v.isRecommended)?.voice ||
          englishVoices[0].voice;
        onVoiceChange?.(recommendedVoice);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice, onVoiceChange]);

  const isRecommendedVoice = (voice: SpeechSynthesisVoice): boolean => {
    const recommendedNames = [
      "Microsoft Zira",
      "Microsoft David",
      "Google US English",
      "Alex",
      "Samantha",
      "Daniel",
      "Karen",
      "Moira",
    ];

    return (
      recommendedNames.some((name) => voice.name.includes(name)) ||
      (voice.lang === "en-US" && voice.default)
    );
  };

  const handleVoiceChange = (value: string) => {
    const selectedOption = voices.find((v) => v.value === value);
    onVoiceChange?.(selectedOption?.voice || null);
  };

  const testVoice = async (voice?: SpeechSynthesisVoice) => {
    if (!voice && !selectedVoice) return;

    setIsPlaying(true);
    speechSynthesis.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(
        "Hello, this is a test of the selected English voice for pronunciation practice."
      );

      if (voice || selectedVoice) {
        utterance.voice = voice || selectedVoice;
        utterance.lang = (voice || selectedVoice)!.lang;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Voice test error:", error);
      setIsPlaying(false);
    }
  };

  if (voices.length === 0) {
    return (
      <Alert
        message="Loading voices..."
        description="Please wait while we load available English voices for pronunciation practice."
        type="info"
        showIcon
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <SettingOutlined className="text-blue-600" />
        <span className="font-medium text-gray-700">Voice Settings</span>
        <Button
          type="link"
          size="small"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide" : "Show"} Options
        </Button>
      </div>

      {showAdvanced && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select English Voice:
            </label>
            <Space.Compact style={{ width: "100%" }}>
              <Select
                style={{ width: "100%" }}
                placeholder="Choose an English voice"
                value={
                  selectedVoice
                    ? `${selectedVoice.name}-${selectedVoice.lang}`
                    : undefined
                }
                onChange={handleVoiceChange}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={voices.map((voice) => ({
                  value: voice.value,
                  label: voice.label,
                }))}
              />
              <Tooltip title="Test selected voice">
                <Button
                  icon={<SoundOutlined />}
                  onClick={() => testVoice()}
                  loading={isPlaying}
                  disabled={!selectedVoice}
                >
                  Test
                </Button>
              </Tooltip>
            </Space.Compact>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              ⭐ <strong>Recommended voices</strong> are optimized for English
              pronunciation practice.
            </p>
            <p>
              📱 <strong>iOS users:</strong> This will override the default
              system voice to ensure English pronunciation.
            </p>
            <p>
              🔧 <strong>Tip:</strong> If you hear a Vietnamese accent, select a
              different voice marked with ⭐.
            </p>
          </div>

          {selectedVoice && (
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-green-700 mb-1">
                Selected Voice:
              </h4>
              <p className="text-sm">
                <strong>{selectedVoice.name}</strong> ({selectedVoice.lang})
                {isRecommendedVoice(selectedVoice) && (
                  <span className="text-orange-500"> ⭐ Recommended</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Default: {selectedVoice.default ? "Yes" : "No"} | Local:{" "}
                {selectedVoice.localService ? "Yes" : "No"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;
