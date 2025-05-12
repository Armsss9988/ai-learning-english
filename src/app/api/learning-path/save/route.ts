import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const body = await request.json();
    const { learningPath, currentLesson } = body;

    const savedLearningPath = await prisma.learningPath.create({
      data: {
        title: learningPath.title,
        description: learningPath.description,
        topics: learningPath.topics,
        totalLessons: learningPath.totalLessons,
        estimatedTime: learningPath.estimatedTime,
        keySkills: learningPath.keySkills,
        userId: decoded.userId,
        lessons: {
          create: currentLesson ? {
            title: currentLesson.title,
            theory: currentLesson.theory,
            questions: currentLesson.questions,
            lessonNumber: currentLesson.lessonNumber,
          } : undefined,
        },
      },
      include: {
        lessons: true,
      },
    });

    return NextResponse.json(savedLearningPath);
  } catch (error) {
    console.error('Save learning path error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 