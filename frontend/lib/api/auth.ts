import { apiRequest } from "@/lib/api/client";
import { setAuthSession, type StoredUser } from "@/lib/auth";

type AuthPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
  userId: string;
  email: string;
};

export type UserProfile = {
  id: string;
  email: string;
  createdAt: string;
};

export async function postAuth(
  endpoint: "login" | "register",
  payload: AuthPayload,
): Promise<StoredUser> {
  const result = await apiRequest<AuthResponse>(`/api/auth/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const session: StoredUser = {
    token: result.token,
    userId: result.userId,
    email: result.email,
  };

  setAuthSession(session);
  return session;
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/auth/me");
}
