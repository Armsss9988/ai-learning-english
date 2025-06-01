import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lessonId = url.searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        {
          error: "lessonId parameter is required",
        },
        { status: 400 }
      );
    }

    console.log("Testing lesson data fetch for ID:", lessonId);

    const lessonContext = await prisma.lesson.findUnique({
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

    if (!lessonContext) {
      return NextResponse.json(
        {
          error: "Lesson not found",
        },
        { status: 404 }
      );
    }

    // Format questions như trong chat API
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

    // Truncate theory như trong chat API
    const maxTheoryLength = 2000;
    const truncatedTheory =
      lessonContext.theory && lessonContext.theory.length > maxTheoryLength
        ? lessonContext.theory.substring(0, maxTheoryLength) + "..."
        : lessonContext.theory || "Chưa có nội dung lý thuyết.";

    const promptData = {
      lessonTitle: lessonContext.title || "Bài học không có tiêu đề",
      lessonTheory: truncatedTheory,
      lessonQuestions: questionsText,
    };

    return NextResponse.json({
      success: true,
      lessonContext: {
        id: lessonContext.id,
        title: lessonContext.title,
        theoryLength: lessonContext.theory?.length || 0,
        questionsCount: lessonContext.questions?.length || 0,
      },
      promptData: {
        lessonTitle: promptData.lessonTitle,
        theoryLength: promptData.lessonTheory.length,
        questionsLength: promptData.lessonQuestions.length,
        theoryPreview: promptData.lessonTheory.substring(0, 200) + "...",
        questionsPreview: promptData.lessonQuestions.substring(0, 300) + "...",
      },
      rawData: {
        title: lessonContext.title,
        theory: lessonContext.theory?.substring(0, 500),
        questionsCount: lessonContext.questions?.length,
        firstQuestion: lessonContext.questions?.[0],
      },
    });
  } catch (error) {
    console.error("Test chat API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
