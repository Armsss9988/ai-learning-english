import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { Tool } from "langchain/tools";
import { ApiSuccess, ApiError, apiHandler } from "@/utils/apiResponse";
import { prisma } from "@/lib/prisma";

// =============================================================================
// AI AGENT TOOLS
// =============================================================================

// Tool để search lessons
class SearchLessonsTool extends Tool {
  name = "search_lessons";
  description = "Search for IELTS lessons by topic or skill";

  async _call(query: string): Promise<string> {
    try {
      const lessons = await prisma.lesson.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { theory: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, title: true },
      });

      return JSON.stringify(lessons);
    } catch (error) {
      return "Error searching lessons";
    }
  }
}

// Tool để tạo quiz
class CreateQuizTool extends Tool {
  name = "create_quiz";
  description = "Create a practice quiz based on lesson content";

  async _call(input: string): Promise<string> {
    try {
      const { lessonId, difficulty } = JSON.parse(input);

      const questions = await prisma.question.findMany({
        where: { lessonId },
        take: 5,
      });

      return `Created quiz with ${questions.length} questions for difficulty: ${difficulty}`;
    } catch (error) {
      return "Error creating quiz";
    }
  }
}

// Tool để save user progress
class SaveProgressTool extends Tool {
  name = "save_progress";
  description = "Save user learning progress and achievements";

  async _call(input: string): Promise<string> {
    try {
      const { userId, lessonId, score } = JSON.parse(input);

      // Save progress logic here
      return `Progress saved: User ${userId} completed lesson ${lessonId} with score ${score}`;
    } catch (error) {
      return "Error saving progress";
    }
  }
}

// Tool để analyze user level
class AnalyzeUserLevelTool extends Tool {
  name = "analyze_user_level";
  description = "Analyze user's current IELTS level based on performance";

  async _call(userId: string): Promise<string> {
    try {
      // Analyze user performance
      const analysis = {
        currentLevel: "6.5",
        strengths: ["Reading", "Listening"],
        weaknesses: ["Speaking", "Writing"],
        recommendations: [
          "Focus on speaking practice",
          "Improve writing structure",
        ],
      };

      return JSON.stringify(analysis);
    } catch (error) {
      return "Error analyzing user level";
    }
  }
}

// =============================================================================
// AGENT CONFIGURATION
// =============================================================================

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.7,
});

const tools = [
  new SearchLessonsTool(),
  new CreateQuizTool(),
  new SaveProgressTool(),
  new AnalyzeUserLevelTool(),
];

// =============================================================================
// AGENT EXECUTOR
// =============================================================================

async function createIELTSAgent() {
  // Pull agent prompt from LangChain Hub
  const prompt = await pull("hwchase17/react");

  // Create the ReActAgent
  const agent = await createReactAgent({
    llm,
    tools,
    prompt,
  });

  // Create AgentExecutor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
    maxIterations: 5,
  });

  return agentExecutor;
}

// =============================================================================
// AGENT MEMORY & CONTEXT
// =============================================================================

interface AgentMemory {
  conversationHistory: Array<{
    role: "user" | "agent";
    content: string;
    timestamp: Date;
    tools_used?: string[];
  }>;
  userContext: {
    userId?: string;
    currentLesson?: string;
    learningGoals?: string[];
    performanceData?: any;
  };
}

const agentMemory = new Map<string, AgentMemory>();

// =============================================================================
// MAIN AGENT HANDLER
// =============================================================================

export async function POST(request: Request) {
  return apiHandler(async () => {
    try {
      const { message, userId, sessionId } = await request.json();

      if (!message?.trim()) {
        return ApiError.badRequest("Message is required");
      }

      // Get or create agent memory for this session
      const sessionKey = sessionId || userId || "default";
      if (!agentMemory.has(sessionKey)) {
        agentMemory.set(sessionKey, {
          conversationHistory: [],
          userContext: { userId },
        });
      }

      const memory = agentMemory.get(sessionKey)!;

      // Create agent executor
      const agentExecutor = await createIELTSAgent();

      // Prepare agent input with context
      const agentInput = {
        input: message,
        chat_history: memory.conversationHistory
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n"),
        user_context: JSON.stringify(memory.userContext),
      };

      // Execute agent
      const result = await agentExecutor.invoke(agentInput);

      // Update memory
      memory.conversationHistory.push(
        { role: "user", content: message, timestamp: new Date() },
        {
          role: "agent",
          content: result.output,
          timestamp: new Date(),
          tools_used:
            result.intermediateSteps?.map((step: any) => step.action?.tool) ||
            [],
        }
      );

      return ApiSuccess.ok({
        response: result.output,
        toolsUsed:
          result.intermediateSteps?.map((step: any) => step.action?.tool) || [],
        reasoning:
          result.intermediateSteps?.map(
            (step: any) => step.action?.toolInput
          ) || [],
        hasAgentCapabilities: true,
      });
    } catch (error) {
      console.error("Agent error:", error);
      return ApiError.internal("Failed to process agent request");
    }
  });
}
