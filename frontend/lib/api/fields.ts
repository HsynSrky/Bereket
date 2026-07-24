import { apiRequest } from "@/lib/api/client";

export type Field = {
  id: string;
  name: string;
  cropType: string;
  polygonGeoJson: string;
  areaSqMeters: number;
  centerLat: number;
  centerLng: number;
  createdAt: string;
};

export type CreateFieldPayload = {
  name: string;
  cropType: string;
  polygonGeoJson: string;
};

export type UpdateFieldPayload = CreateFieldPayload;

export async function getFields(): Promise<Field[]> {
  return apiRequest<Field[]>("/api/fields");
}

export async function getField(id: string): Promise<Field> {
  return apiRequest<Field>(`/api/fields/${id}`);
}

export async function createField(payload: CreateFieldPayload): Promise<Field> {
  return apiRequest<Field>("/api/fields", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateField(
  id: string,
  payload: UpdateFieldPayload,
): Promise<Field> {
  return apiRequest<Field>(`/api/fields/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteField(id: string): Promise<void> {
  await apiRequest<void>(`/api/fields/${id}`, {
    method: "DELETE",
  });
}

export function formatArea(areaSqMeters: number): string {
  const decares = areaSqMeters / 1000;
  if (decares >= 1) {
    return `${decares.toFixed(2)} dönüm`;
  }

  return `${Math.round(areaSqMeters)} m²`;
}
