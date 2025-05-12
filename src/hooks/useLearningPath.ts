import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningPathApi } from '@/api/learningPath';
import { LearningPath } from '@prisma/client';

export const useLearningPaths = () => {
  return useQuery({
    queryKey: ['learningPaths'],
    queryFn: learningPathApi.getAll
  });
};

export const useLearningPath = (id: string) => {
  return useQuery({
    queryKey: ['learningPath', id],
    queryFn: () => learningPathApi.getById(id),
    enabled: !!id
  });
};

export const useSaveLearningPath = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (learningPath: LearningPath) => 
      learningPathApi.save(learningPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
    }
  });
}; 