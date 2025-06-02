import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonsApi } from "@/api/lessons";
import { Lesson } from "@prisma/client";

export const useLessonsByLearningPath = (learningPathId: string) => {
  return useQuery({
    queryKey: ["lessons", learningPathId],
    queryFn: () => lessonsApi.getByLearningPathId(learningPathId),
    enabled: !!learningPathId,
  });
};

export const useLesson = (id: string) => {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => lessonsApi.getById(id),
    enabled: !!id,
  });
};

export const useSaveLesson = (learningPathId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lesson: Omit<Lesson, "id" | "createdAt" | "updatedAt">) =>
      lessonsApi.save(lesson, learningPathId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", learningPathId] });
    },
  });
};

export const useGenerateLesson = () => {
  return useMutation({
    mutationFn: (topic: string) => lessonsApi.generate(topic),
  });
};

export const useEvaluateResponse = () => {
  return useMutation({
    mutationFn: ({
      questionId,
      questionContent,
      answer,
      audio,
      criteria,
      questionType,
    }: {
      questionId: string;
      questionContent?: string;
      answer?: string;
      audio?: string;
      criteria: string[];
      questionType: string;
    }) =>
      lessonsApi.evaluate(
        questionId,
        criteria,
        questionType,
        answer,
        audio,
        questionContent
      ),
  });
};

export const useUploadAudio = () => {
  return useMutation({
    mutationFn: (audioBlob: Blob) => lessonsApi.uploadAudio(audioBlob),
  });
};

export const useUpdateLessonStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      isCompleted,
    }: {
      lessonId: string;
      isCompleted: boolean;
    }) => lessonsApi.updateStatus(lessonId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
  });
};
