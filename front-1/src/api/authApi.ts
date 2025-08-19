import apiClient, { API_BASE_URL, PATHS, authToken } from "@/api/apiClient";

export type LoginReq = { email: string; password: string };

export async function login(body: LoginReq): Promise<void> {
  const res = await apiClient.post(`${API_BASE_URL}${PATHS.login}`, body, {
    withCredentials: true,
  });

  // 백엔드가 'token' 키로 내려줌
  const token: unknown =
    (res as any)?.data?.data?.accessToken ??
    (res as any)?.data?.accessToken ??
    (res as any)?.data?.token;

  if (typeof token === "string" && token.length > 0) {
    authToken.set(token);
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(`${API_BASE_URL}${PATHS.logout}`, {}, { withCredentials: true });
  } finally {
    authToken.clear();
  }
}
