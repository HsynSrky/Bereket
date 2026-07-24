import { apiRequest } from "./client";

export type Transaction = {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  fieldId?: string | null;
  createdAt: string;
};

export type CreateTransactionDto = Omit<Transaction, "id" | "createdAt">;

export async function getTransactions(): Promise<Transaction[]> {
  return apiRequest("/api/finances");
}

export async function createTransaction(data: CreateTransactionDto): Promise<Transaction> {
  return apiRequest("/api/finances", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  return apiRequest(`/api/finances/${id}`, {
    method: "DELETE",
  });
}
