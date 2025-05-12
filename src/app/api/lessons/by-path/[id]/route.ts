import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
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
