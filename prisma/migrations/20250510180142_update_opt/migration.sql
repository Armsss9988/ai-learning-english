/*
  Warnings:

  - The values [listening] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `options` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('multiple_choice', 'fill_blank', 'essay', 'speaking', 'reading', 'drag_drop', 'matching', 'ordering', 'categorization', 'highlighting');
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "options",
ADD COLUMN     "options" JSONB NOT NULL;
