import { NextResponse } from "next/server";

// =============================================================================
// AUDIO ANALYSIS HELPERS
// =============================================================================

interface AudioAnalysisResult {
  hasAudio: boolean;
  audioQuality: "excellent" | "good" | "fair" | "poor";
  estimatedDuration: number;
  pronunciationFeedback: string[];
}

function analyzeAudioData(audioData?: string): AudioAnalysisResult {
  if (!audioData) {
    return {
      hasAudio: false,
      audioQuality: "poor",
      estimatedDuration: 0,
      pronunciationFeedback: [],
    };
  }

  // Basic audio data analysis (in a real app, you'd use proper audio processing)
  const audioSize = audioData.length;
  const estimatedDuration = Math.max(1, Math.floor(audioSize / 50000)); // Rough estimation

  let quality: "excellent" | "good" | "fair" | "poor" = "poor";
  if (audioSize > 100000) quality = "excellent";
  else if (audioSize > 50000) quality = "good";
  else if (audioSize > 20000) quality = "fair";

  const pronunciationFeedback = generatePronunciationFeedback(
    quality,
    estimatedDuration
  );

  return {
    hasAudio: true,
    audioQuality: quality,
    estimatedDuration,
    pronunciationFeedback,
  };
}

function generatePronunciationFeedback(
  quality: string,
  duration: number
): string[] {
  const feedback: string[] = [];

  // Duration feedback
  if (duration < 2) {
    feedback.push(
      "Try to speak more clearly and at a natural pace. Very short responses may not show your full speaking ability."
    );
  } else if (duration > 30) {
    feedback.push(
      "Good detailed response! Make sure to stay focused on the main points."
    );
  } else {
    feedback.push("Good response length - appropriate for the question type.");
  }

  // Quality feedback
  switch (quality) {
    case "excellent":
      feedback.push(
        "Clear audio quality detected. Your pronunciation appears to be well-articulated."
      );
      feedback.push(
        "Good volume and clarity - this helps with accurate assessment."
      );
      break;
    case "good":
      feedback.push(
        "Good audio quality. Your speech is generally clear with minor background noise."
      );
      feedback.push(
        "Consider speaking slightly closer to the microphone for better clarity."
      );
      break;
    case "fair":
      feedback.push(
        "Fair audio quality. Try to reduce background noise and speak clearly."
      );
      feedback.push(
        "Improving audio quality will help with more detailed pronunciation feedback."
      );
      break;
    case "poor":
      feedback.push(
        "Low audio quality detected. Please check your microphone settings."
      );
      feedback.push(
        "Better audio quality will enable more detailed pronunciation feedback."
      );
      break;
  }

  return feedback;
}

// =============================================================================
// ENHANCED EVALUATION LOGIC
// =============================================================================

function generateEnhancedPrompt(
  questionType: string,
  hasAudio: boolean,
  audioAnalysis?: AudioAnalysisResult
): string {
  let basePrompt = `You are a JSON API. You must respond with valid JSON only, no other text.
You are an experienced IELTS instructor providing detailed evaluation feedback.`;

  if (hasAudio && audioAnalysis) {
    basePrompt += `

AUDIO ANALYSIS AVAILABLE:
- Audio Quality: ${audioAnalysis.audioQuality}
- Duration: ~${audioAnalysis.estimatedDuration} seconds
- Audio-based insights: ${audioAnalysis.pronunciationFeedback.join(". ")}

Based on the audio analysis, provide additional insights about:`;

    if (questionType === "speaking") {
      basePrompt += `
- Pronunciation clarity and naturalness
- Speaking pace and rhythm  
- Confidence and fluency indicators
- Voice projection and clarity`;
    }
  }

  return basePrompt;
}

function calculateScoreWithAudio(
  baseScore: number,
  audioAnalysis?: AudioAnalysisResult
): number {
  if (!audioAnalysis?.hasAudio) return baseScore;

  // Only adjust score based on audio quality, not duration
  let adjustment = 0;
  switch (audioAnalysis.audioQuality) {
    case "excellent":
      adjustment = 0.2; // Slight bonus for clear audio
      break;
    case "good":
      adjustment = 0.1;
      break;
    case "fair":
      adjustment = 0;
      break;
    case "poor":
      adjustment = -0.2;
      break;
  }

  return Math.max(1, Math.min(5, baseScore + adjustment));
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

async function callGeminiAPIWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<GeminiResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(process.env.VITE_GEMINI_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        return await response.json();
      }

      // Handle specific error codes
      if (response.status === 503) {
        if (attempt < maxRetries) {
          console.log(
            `Gemini API 503 error, retrying... (${attempt}/${maxRetries})`
          );
          // Wait before retry: 1s, 2s, 4s
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
          );
          continue;
        }
      }

      throw new Error(`Gemini API error: ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(
        `API call failed, retrying... (${attempt}/${maxRetries})`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error("All retry attempts failed");
}

// =============================================================================
// MAIN API HANDLER
// =============================================================================

export async function POST(req: Request) {
  try {
    const { answer, criteria, questionType, audio, audioUrl, questionContent } =
      await req.json();

    // Analyze audio if provided
    const audioData = audio || audioUrl;
    const audioAnalysis = analyzeAudioData(audioData);

    // Generate enhanced prompt
    const basePrompt = generateEnhancedPrompt(
      questionType,
      audioAnalysis.hasAudio,
      audioAnalysis
    );

    const prompt = `${basePrompt}
    
    Evaluate the following ${questionType} response based on the given criteria.
    
    QUESTION: ${questionContent || "No question content provided"}
    
    ${answer && `STUDENT RESPONSE: ${answer}`}
    ${
      audioAnalysis.hasAudio
        ? "\n[Audio response analysis included in evaluation]"
        : ""
    }
    
    EVALUATION CRITERIA:
    ${criteria.map((c: string) => `- ${c}`).join("\n")}
    
    STRICT EVALUATION RULES:
    1. RELEVANCE CHECK FIRST: If the response does NOT address the question or is completely irrelevant → Score = 1/5
    2. If response is somewhat relevant but poor quality → Score = 2/5  
    3. If response addresses the question adequately → Score = 3/5
    4. If response addresses the question well with good criteria performance → Score = 4/5
    5. If response excellently addresses the question and meets all criteria → Score = 5/5
    
    Please evaluate the student's response and provide:
    1. A score from 1-5 (where 1 = irrelevant/no answer, 5 = excellent)
    2. Detailed feedback explaining the score and suggesting improvements
    
    IMPORTANT: Keep your feedback concise and under 50 words. Focus on:
    - FIRST: Does the response answer the specific question? (If NO → Score 1)
    - Performance against each evaluation criterion
    - Specific, actionable improvement suggestions
    
    ${
      questionType === "speaking" && audioAnalysis.hasAudio
        ? `
    For speaking assessment, also consider:
    - Pronunciation and clarity (based on audio analysis)
    - Fluency and natural speech rhythm
    - Confidence and voice projection
    - Overall speaking effectiveness`
        : ""
    }
    
    You must respond with a JSON object in this exact format:
    {
      "score": number,
      "feedback": string
    }
    
    Do not include any text before or after the JSON object.`;

    // Use retry mechanism for API call
    const data = await callGeminiAPIWithRetry(prompt);
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content received from Gemini");
    }

    try {
      // Try to parse JSON directly first
      let evaluation;
      try {
        evaluation = JSON.parse(content);
      } catch {
        // If direct parsing fails, try to extract JSON from code block
        const jsonMatch =
          content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in response");
        }
        evaluation = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }

      // Enhance the evaluation with audio analysis
      if (audioAnalysis.hasAudio) {
        const adjustedScore = calculateScoreWithAudio(
          evaluation.score,
          audioAnalysis
        );

        // Keep enhanced feedback concise and focused on criteria
        let enhancedFeedback = evaluation.feedback;

        // Only add audio quality if it's noteworthy (not standard quality)
        if (
          questionType === "speaking" &&
          (audioAnalysis.audioQuality === "excellent" ||
            audioAnalysis.audioQuality === "poor")
        ) {
          enhancedFeedback += `\n**Audio:** ${audioAnalysis.audioQuality} quality detected.`;
        }

        return NextResponse.json({
          score: adjustedScore,
          feedback: enhancedFeedback,
          audioAnalysis:
            questionType === "speaking"
              ? {
                  quality: audioAnalysis.audioQuality,
                  duration: audioAnalysis.estimatedDuration,
                  hasAudioEnhancement: true,
                }
              : undefined,
        });
      }

      return NextResponse.json(evaluation);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw content:", content);

      // Fallback evaluation
      return NextResponse.json({
        score: 1,
        feedback:
          "Unable to parse evaluation. Please check if your response addresses the question and try again.",
        error: "parsing_failed",
      });
    }
  } catch (error) {
    console.error("Error evaluating response:", error);

    // Provide more specific error messages
    let errorMessage =
      "Evaluation failed due to technical issues. Please try again.";
    if (error instanceof Error) {
      if (error.message.includes("503")) {
        errorMessage =
          "AI service is temporarily busy. Please try again in a moment.";
      } else if (error.message.includes("API")) {
        errorMessage =
          "AI service is currently unavailable. Please try again later.";
      }
    }

    return NextResponse.json(
      {
        error: "Failed to evaluate response",
        details: error instanceof Error ? error.message : "Unknown error",
        score: 1,
        feedback: errorMessage,
      },
      { status: 500 }
    );
  }
}
