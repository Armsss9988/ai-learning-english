import axiosInstance from "@/lib/axios";
import { Lesson } from "@prisma/client";

export const lessonsApi = {
  getByLearningPathId: async (learningPathId: string) => {
    const response = await axiosInstance.get<Lesson[]>(
      `/lessons/by-path/${learningPathId}`
    );
    return response.data;
  },

  save: async (
    lesson: Omit<Lesson, "id" | "createdAt" | "updatedAt">,
    learningPathId: string
  ) => {
    const response = await axiosInstance.post<Lesson>("/lessons/save", {
      lesson,
      learningPathId,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/lessons/${id}`);
    return response.data;
  },

  generate: async (topic: string) => {
    const response = await axiosInstance.post<Lesson>("/lessons", { topic });
    return response.data;
  },

  evaluate: async (
    questionId: string,
    criteria: string[],
    questionType: string,
    answer?: string,
    audio?: string,
    questionContent?: string
  ) => {
    const response = await axiosInstance.post("/evaluate", {
      questionId,
      questionContent,
      answer,
      criteria,
      questionType,
      audio,
    });
    return response.data;
  },

  uploadAudio: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    const response = await axiosInstance.post<{ url: string }>(
      "/upload-audio",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  updateStatus: async (lessonId: string, isCompleted: boolean) => {
    const response = await axiosInstance.patch<Lesson>(
      "/lessons/updateStatus",
      {
        lessonId,
        isCompleted,
      }
    );
    return response.data;
  },
};
