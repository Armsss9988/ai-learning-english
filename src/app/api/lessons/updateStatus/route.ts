import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Corrected import statement

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { lessonId, isCompleted } = body;

  if (!lessonId || typeof isCompleted !== "boolean") {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  try {
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { isCompleted },
    });

    return NextResponse.json({
      message: "Lesson status updated successfully",
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error("Error updating lesson status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
