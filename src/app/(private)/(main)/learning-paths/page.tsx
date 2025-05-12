"use client";
import { useState } from "react";
import LearningPathGenerator from "@/components/LearningPathGenerator";
import { LearningPath } from "@prisma/client";
import LearningPathViewer from "@/components/LearningPathViewer";
export default function LearningPathsPage() {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);

  const handleLearningPathGenerated = (learningPath: LearningPath) => {
    setLearningPath(learningPath);
  };
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <LearningPathGenerator
          onLearningPathGenerated={handleLearningPathGenerated}
        />
      </div>
      {learningPath && (
        <LearningPathViewer
          learningPath={learningPath!}
          onSave={() => setLearningPath(null)}
        />
      )}
    </main>
  );
}
