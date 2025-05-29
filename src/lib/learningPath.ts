// lib/learning-path.ts
import { prisma } from "@/lib/prisma";

export async function getLearningPathById(id: string) {
  if (!id) throw new Error("No ID provided");

  const learningPath = await prisma.learningPath.findUnique({
    where: { id },
    include: {
      lessons: {
        include: {
          questions: true,
        },
      },
    },
  });

  return learningPath;
}
// export async function createLearningPath(startLevel: string, targetLevel: string) {
//   if (!startLevel || !targetLevel) throw new Error("Start and target levels are required");

//   const learningPath = await prisma.learningPath.create({
//     data: {
//       startLevel,
//       targetLevel,
//       lessons: {
//         create: [], // Initialize with no lessons
//       },
//     },
//   });

//   return learningPath;
// }