/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `audioUrl` on the `QuestionResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "audioUrl",
ADD COLUMN     "audioText" TEXT;

-- AlterTable
ALTER TABLE "QuestionResponse" DROP COLUMN "audioUrl",
ADD COLUMN     "audioText" TEXT;
