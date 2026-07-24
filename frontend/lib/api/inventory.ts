import { apiRequest } from "./client";

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  description: string | null;
  createdAt: string;
  userId: string;
};

export type CreateInventoryItemDto = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  description?: string;
};

export async function getInventoryItems(): Promise<InventoryItem[]> {
  return apiRequest("/api/inventory", {
    method: "GET",
  });
}

export async function createInventoryItem(data: CreateInventoryItemDto): Promise<InventoryItem> {
  return apiRequest("/api/inventory", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteInventoryItem(id: string): Promise<void> {
  return apiRequest(`/api/inventory/${id}`, {
    method: "DELETE",
  });
}
