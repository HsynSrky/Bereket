import { apiRequest } from "./client";

export type FarmTask = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string; // Bekliyor, Tamamlandı, İptal
  category: string; // İlaçlama, Sulama, Hasat vs.
  fieldId?: string | null;
  createdAt: string;
};

export type CreateTaskDto = Omit<FarmTask, "id" | "createdAt">;

export async function getTasks(): Promise<FarmTask[]> {
  return apiRequest("/api/tasks");
}

export async function createTask(data: CreateTaskDto): Promise<FarmTask> {
  return apiRequest("/api/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
