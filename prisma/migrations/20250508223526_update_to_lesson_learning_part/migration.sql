/*
  Warnings:

  - You are about to drop the `SavedLesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedLessonPart` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SavedLesson" DROP CONSTRAINT "SavedLesson_savedLessonPartId_fkey";

-- DropForeignKey
ALTER TABLE "SavedLessonPart" DROP CONSTRAINT "SavedLessonPart_userId_fkey";

-- DropTable
DROP TABLE "SavedLesson";

-- DropTable
DROP TABLE "SavedLessonPart";

-- CreateTable
CREATE TABLE "LearningPart" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topics" TEXT[],
    "totalLessons" INTEGER NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "keySkills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LearningPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "theory" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "learningPartId" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LearningPart" ADD CONSTRAINT "LearningPart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_learningPartId_fkey" FOREIGN KEY ("learningPartId") REFERENCES "LearningPart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
