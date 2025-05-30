"use server";
import LearningPathGenerator from "@/components/LearningPathGenerator";

export default async function LearningPathsPage() {
  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-20 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto animate-slide-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            Create Your Learning Path
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Generate personalized IELTS learning paths tailored to your current
            level and goals. Our AI will create a comprehensive study plan just
            for you.
          </p>
        </div>
        <LearningPathGenerator />
      </div>
    </div>
  );
}
