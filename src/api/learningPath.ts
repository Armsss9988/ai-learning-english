import axiosInstance from '@/lib/axios';
import { LearningPath } from '@prisma/client';

export const learningPathApi = {
  getAll: async () => {
    const response = await axiosInstance.get<LearningPath[]>('/learning-path');
    return response.data;
  },

  save: async (learningPath: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await axiosInstance.post<LearningPath>('/learning-path/save', { learningPath });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<LearningPath>(`/learning-path/${id}`);
    return response.data;
  }
}; 