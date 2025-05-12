import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { Question } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token but we don't need the userId for this endpoint
    verify(token, process.env.JWT_SECRET || "your-secret-key");

    const body = await request.json();
    const { lesson, learningPathId } = body;

    if (!lesson || !learningPathId) {
      return NextResponse.json(
        { error: "Lesson and learningPathId are required" },
        { status: 400 }
      );
    }

    // // Validate required lesson fields
    // if (!lesson.title || !lesson.theory || !lesson.lessonNumber) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Lesson must include title, theory, questions, and lessonNumber",
    //     },
    //     { status: 400 }
    //   );
    // }

    const savedLesson = await prisma.lesson.create({
      data: {
        title: lesson.title,
        theory: lesson.theory,
        lessonNumber: lesson.lessonNumber,
        learningPathId: learningPathId,
        questions: {
          create: lesson.questions.map((q: Question) => ({
            question: q.question,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            evaluationCriteria: q.evaluationCriteria || [],
            audioText: q.audioText,
            imageUrl: q.imageUrl,
            timeLimit: q.timeLimit,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(savedLesson);
  } catch (error) {
    console.error("Save lesson error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
