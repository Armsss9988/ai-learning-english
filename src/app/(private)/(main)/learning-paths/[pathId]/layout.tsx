"use server";

import { getLearningPathById } from "@/lib/learningPath";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ pathId: string }>;
};
export default async function LearningPathLayout({
  children,
  params,
}: LayoutProps) {
  const queryClient = new QueryClient();
  const id = (await params).pathId;
  console.log("learningPathId", id);
  await queryClient.prefetchQuery({
    queryKey: ["learning-path", id],
    queryFn: async () => await getLearningPathById(id),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </div>
  );
}
