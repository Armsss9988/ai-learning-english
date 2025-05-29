"use server";
import LearningPathGenerator from "@/components/LearningPathGenerator";

export default async function LearningPathsPage() {
  return (
    <div className="container mx-auto px-4 py-8 b">
      <LearningPathGenerator />
    </div>
  );
}
