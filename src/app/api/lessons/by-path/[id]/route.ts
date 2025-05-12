import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const id = new URL(request.url).pathname.split("/").pop();
    const lessons = await prisma.lesson.findMany({
      where: {
        learningPathId: id,
      },
      orderBy: {
        lessonNumber: "asc",
      },
      include: {
        questions: {
          include: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
