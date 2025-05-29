"use server";
import LearningPathGenerator from "@/components/LearningPathGenerator";

export default async function LearningPathsPage() {
  return (
    <div className="mx-auto px-20 py-8">
      <LearningPathGenerator />
    </div>
  );
}
