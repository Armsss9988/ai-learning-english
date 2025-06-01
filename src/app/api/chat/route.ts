import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ApiSuccess, ApiError, apiHandler } from "@/utils/apiResponse";
import { prisma } from "@/lib/prisma";

interface ChatRequest {
  message: string;
  lessonId?: string;
  userId?: string;
}

// Initialize the LLM with Gemini
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.7,
  maxOutputTokens: 2048,
});

// Create a prompt template for lesson-aware conversations
const lessonAwarePrompt = PromptTemplate.fromTemplate(`
Bạn là trợ lý AI cho một nền tảng học IELTS. Vai trò của bạn là giúp học sinh với nội dung bài học và chuẩn bị IELTS.

NGỮ CẢNH BÀI HỌC:
Tiêu đề: {lessonTitle}
Lý thuyết: {lessonTheory}
Câu hỏi: {lessonQuestions}

QUY TẮC TRUYỆN THOẠI:
1. Chỉ trả lời các câu hỏi liên quan đến:
   - Nội dung bài học hiện tại
   - Chiến lược chuẩn bị IELTS
   - Học tiếng Anh
   - Ngữ pháp, từ vựng, nói, viết, đọc, nghe

2. Nếu người dùng hỏi về các chủ đề không liên quan đến IELTS hoặc học tiếng Anh, hãy trả lời:
   "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến IELTS và nội dung bài học. Bạn có thể hỏi tôi về bài học hiện tại hoặc các kỹ năng IELTS khác."

3. Hãy hữu ích, khuyến khích và cung cấp giải thích chi tiết khi thảo luận về nội dung bài học.

4. Luôn trả lời bằng tiếng Việt một cách tự nhiên và dễ hiểu.

CÂU HỎI CỦA NGƯỜI DÙNG: {question}

TRẢ LỜI:`);

// Create a prompt for general IELTS conversations (when no lesson context)
const generalIELTSPrompt = PromptTemplate.fromTemplate(`
Bạn là trợ lý AI cho một nền tảng học IELTS. Vai trò của bạn là giúp học sinh chuẩn bị IELTS.

QUY TẮC TRUYỆN THOẠI:
1. Chỉ trả lời các câu hỏi liên quan đến:
   - Chiến lược chuẩn bị IELTS
   - Học tiếng Anh
   - Ngữ pháp, từ vựng, nói, viết, đọc, nghe
   - Mẹo và kỹ thuật học tập

2. Nếu người dùng hỏi về các chủ đề không liên quan đến IELTS hoặc học tiếng Anh, hãy trả lời:
   "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến IELTS và học tiếng Anh. Bạn có câu hỏi nào về IELTS không?"

3. Hãy hữu ích, khuyến khích và cung cấp lời khuyên thực tế cho việc chuẩn bị IELTS.

4. Luôn trả lời bằng tiếng Việt một cách tự nhiên và dễ hiểu.

CÂU HỎI CỦA NGƯỜI DÙNG: {question}

TRẢ LỜI:`);

const outputParser = new StringOutputParser();

export async function POST(request: Request) {
  return apiHandler(async () => {
    try {
      const body: ChatRequest = await request.json();
      const { message, lessonId } = body;

      if (!message?.trim()) {
        return ApiError.badRequest("Message is required");
      }

      let lessonContext = null;

      // If lessonId is provided, fetch lesson data
      if (lessonId) {
        try {
          lessonContext = await prisma.lesson.findUnique({
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

          // Debug log để kiểm tra data
          console.log("Lesson context fetched:", {
            lessonId,
            title: lessonContext?.title,
            theoryLength: lessonContext?.theory?.length,
            questionsCount: lessonContext?.questions?.length,
          });
        } catch (error) {
          console.error("Error fetching lesson:", error);
          lessonContext = null;
        }
      }

      let chain: RunnableSequence;

      if (lessonContext) {
        // Create lesson-aware chain với data validation
        let questionsText = "Chưa có câu hỏi cho bài học này.";

        if (lessonContext.questions && lessonContext.questions.length > 0) {
          questionsText = lessonContext.questions
            .map((q, index) => {
              const optionsText =
                q.options && typeof q.options === "object"
                  ? Object.entries(q.options as Record<string, string>)
                      .map(([key, value]) => `   ${key}: ${value}`)
                      .join("\n")
                  : "";

              return `${index + 1}. ${q.question}
${optionsText ? `   Lựa chọn:\n${optionsText}` : ""}
${q.correctAnswer ? `   Đáp án đúng: ${q.correctAnswer}` : ""}
${q.explanation ? `   Giải thích: ${q.explanation}` : ""}`;
            })
            .join("\n\n");
        }

        // Truncate theory nếu quá dài để tránh vượt quá token limit
        const maxTheoryLength = 2000;
        const truncatedTheory =
          lessonContext.theory && lessonContext.theory.length > maxTheoryLength
            ? lessonContext.theory.substring(0, maxTheoryLength) + "..."
            : lessonContext.theory || "Chưa có nội dung lý thuyết.";

        const promptData = {
          lessonTitle: lessonContext.title || "Bài học không có tiêu đề",
          lessonTheory: truncatedTheory,
          lessonQuestions: questionsText,
          question: message,
        };

        // Debug log để kiểm tra prompt data
        console.log("Prompt data:", {
          lessonTitle: promptData.lessonTitle,
          theoryLength: promptData.lessonTheory.length,
          questionsLength: promptData.lessonQuestions.length,
          question: promptData.question,
        });

        chain = RunnableSequence.from([lessonAwarePrompt, llm, outputParser]);

        const response = await chain.invoke(promptData);

        return ApiSuccess.ok({
          response,
          hasLessonContext: true,
          lessonTitle: lessonContext.title,
        });
      } else {
        // Create general IELTS chain
        console.log("Using general IELTS prompt for message:", message);

        chain = RunnableSequence.from([generalIELTSPrompt, llm, outputParser]);

        const response = await chain.invoke({
          question: message,
        });

        return ApiSuccess.ok({
          response,
          hasLessonContext: false,
        });
      }
    } catch (error) {
      console.error("Chat API error:", error);
      return ApiError.internal("Failed to process chat message");
    }
  });
}
