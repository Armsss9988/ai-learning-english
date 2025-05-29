"use server";

import Drawers from "@/components/Drawers";

export default async function LearningPathsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto px-6 md:px-30 py-8">
      <Drawers />
      {children}
    </div>
  );
}
