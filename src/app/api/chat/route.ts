import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { ApiSuccess, ApiError, apiHandler } from "@/utils/apiResponse";
import { prisma } from "@/lib/prisma";

interface ChatRequest {
  message: string;
  lessonId?: string;
  sessionId?: string;
  userId?: string;
}

interface ChatResponse {
  response: string;
  hasLessonContext: boolean;
  lessonTitle?: string;
  sessionId: string;
}

interface LessonData {
  id: string;
  title: string;
  theory: string | null;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    options: unknown;
    correctAnswer: string | null;
    explanation: string | null;
  }>;
}

interface SessionData {
  memory: ConversationSummaryBufferMemory;
  lessonContext: LessonData | null;
  timestamp: number;
  userId?: string;
}

// =============================================================================
// SHARED SESSION STORE WITH CONVERSATION MEMORY
// =============================================================================

declare global {
  // eslint-disable-next-line no-var
  var sessionStore: Map<string, SessionData>;
}

if (!global.sessionStore) {
  global.sessionStore = new Map<string, SessionData>();
}

const sessionStore = global.sessionStore;
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_SESSIONS = 1000;

// =============================================================================
// LLM CONFIGURATION
// =============================================================================

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.7,
  maxOutputTokens: 2048,
});

const outputParser = new StringOutputParser();

// =============================================================================
// CONCISE PROMPTS
// =============================================================================

const lessonAwarePrompt = PromptTemplate.fromTemplate(`
Bạn là AI trợ lý IELTS. Bối cảnh bài học:

**{lessonTitle}**
Lý thuyết: {lessonTheory}
Câu hỏi: {lessonQuestions}

Trả lời ngắn gọn, tập trung vào bài học. Khi được hỏi về "câu 1", "câu 2"... thì trả lời về câu hỏi tương ứng trong danh sách.

Lịch sử: {history}
Người dùng: {input}
AI:`);

const generalPrompt = PromptTemplate.fromTemplate(`
Bạn là AI trợ lý IELTS. Chỉ trả lời về IELTS và tiếng Anh.

Lịch sử: {history}  
Người dùng: {input}
AI:`);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateSessionId(userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${userId || "anon"}_${timestamp}_${random}`;
}

function formatLessonContent(lesson: LessonData): {
  theory: string;
  questions: string;
} {
  const theory = lesson.theory
    ? lesson.theory.length > 1000
      ? lesson.theory.substring(0, 1000) + "..."
      : lesson.theory
    : "Không có lý thuyết";

  const questions =
    lesson.questions.length > 0
      ? lesson.questions
          .map(
            (q, i) =>
              `${i + 1}. ${q.question} ${
                q.correctAnswer ? `(Đáp án: ${q.correctAnswer})` : ""
              }`
          )
          .join(" | ")
      : "Không có câu hỏi";

  return { theory, questions };
}

async function createMemory(): Promise<ConversationSummaryBufferMemory> {
  return new ConversationSummaryBufferMemory({
    llm,
    maxTokenLimit: 1000,
    returnMessages: false,
    inputKey: "input",
    outputKey: "output",
    chatHistory: new ChatMessageHistory(),
  });
}

async function getOrCreateSession(
  sessionId?: string,
  userId?: string,
  lessonId?: string
): Promise<{ sessionId: string; data: SessionData }> {
  let finalSessionId = sessionId;

  if (!finalSessionId) {
    finalSessionId = generateSessionId(userId);
  }

  let sessionData = sessionStore.get(finalSessionId);

  if (!sessionData) {
    const memory = await createMemory();
    sessionData = {
      memory,
      lessonContext: null,
      timestamp: Date.now(),
      userId,
    };
    sessionStore.set(finalSessionId, sessionData);
    console.log(`🆕 Created session: ${finalSessionId}`);
  }

  // Update lesson context if lessonId provided and different
  if (
    lessonId &&
    (!sessionData.lessonContext || sessionData.lessonContext.id !== lessonId)
  ) {
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          questions: {
            select: {
              id: true,
              question: true,
              type: true,
              options: true,
              correctAnswer: true,
              explanation: true,
            },
          },
        },
      });

      if (lesson) {
        sessionData.lessonContext = lesson;
        console.log(`🎯 Updated lesson context: ${lesson.title}`);
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
    }
  }

  sessionData.timestamp = Date.now();
  return { sessionId: finalSessionId, data: sessionData };
}

// Cleanup function
function cleanupSessions() {
  const now = Date.now();
  const expired: string[] = [];

  sessionStore.forEach((data, sessionId) => {
    if (now - data.timestamp > SESSION_TTL) {
      expired.push(sessionId);
    }
  });

  expired.forEach((sessionId) => sessionStore.delete(sessionId));

  if (sessionStore.size > MAX_SESSIONS) {
    const oldest = Array.from(sessionStore.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, sessionStore.size - MAX_SESSIONS);

    oldest.forEach(([sessionId]) => sessionStore.delete(sessionId));
  }
}

setInterval(cleanupSessions, 5 * 60 * 1000);

// =============================================================================
// MAIN CHAT HANDLER
// =============================================================================

export async function POST(request: Request) {
  return apiHandler(async () => {
    try {
      const body: ChatRequest = await request.json();
      const { message, lessonId, sessionId, userId } = body;

      console.log(`💬 Chat request:`, {
        message: message?.substring(0, 50) + "...",
        lessonId,
        sessionId,
        sessionStoreSize: sessionStore.size,
      });

      if (!message?.trim()) {
        return ApiError.badRequest("Message is required");
      }

      // Get or create session with lesson context
      const { sessionId: finalSessionId, data: sessionData } =
        await getOrCreateSession(sessionId, userId, lessonId);

      let response: string;
      let hasLessonContext = false;
      let lessonTitle: string | undefined;

      if (sessionData.lessonContext) {
        // Use lesson-aware prompt with conversation memory
        const { theory, questions } = formatLessonContent(
          sessionData.lessonContext
        );

        const history = await sessionData.memory.loadMemoryVariables({});

        const chain = RunnableSequence.from([
          lessonAwarePrompt,
          llm,
          outputParser,
        ]);

        response = await chain.invoke({
          lessonTitle: sessionData.lessonContext.title,
          lessonTheory: theory,
          lessonQuestions: questions,
          history: history.history || "",
          input: message,
        });

        hasLessonContext = true;
        lessonTitle = sessionData.lessonContext.title;
      } else {
        // Use general prompt with conversation memory
        const history = await sessionData.memory.loadMemoryVariables({});

        const chain = RunnableSequence.from([generalPrompt, llm, outputParser]);

        response = await chain.invoke({
          history: history.history || "",
          input: message,
        });
      }

      // Save conversation to memory
      await sessionData.memory.saveContext(
        { input: message },
        { output: response }
      );

      const chatResponse: ChatResponse = {
        response,
        hasLessonContext,
        lessonTitle,
        sessionId: finalSessionId,
      };

      return ApiSuccess.ok(chatResponse);
    } catch (error) {
      console.error("Chat API error:", error);
      return ApiError.internal("Failed to process chat message");
    }
  });
}
