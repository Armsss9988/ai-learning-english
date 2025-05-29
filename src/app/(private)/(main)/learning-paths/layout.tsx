"use server";

import Drawers from "@/components/Drawers";

export default async function LearningPathsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Drawers />
      {children}
    </div>
  );
}
