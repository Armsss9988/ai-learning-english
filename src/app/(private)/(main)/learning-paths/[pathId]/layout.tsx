"use server";

import { getLearningPathById } from "@/lib/learningPath";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function LearningPathLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { pathId: string };
}) {
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
        <div className="bg-white shadow-md rounded-lg p-6">{children}</div>
      </HydrationBoundary>
    </div>
  );
}
