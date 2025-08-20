import apiClient, { AUTH_ENDPOINTS } from "@/api/apiClient";

export type LoginReq = { email: string; password: string };

// 서버 로그인 호출 → 토큰 문자열만 반환
export async function loginApi(body: LoginReq): Promise<string> {
  const res = await apiClient.post(AUTH_ENDPOINTS.login, body);
  const token: unknown =
    (res as any)?.data?.data?.accessToken ??
    (res as any)?.data?.accessToken ??
    (res as any)?.data?.token;
  if (typeof token !== "string" || !token) throw new Error("토큰이 없습니다.");
  return token;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.logout, {}, { withCredentials: true });
}

// 사용자 프로필(역할) 조회
export async function fetchProfile(): Promise<{ role?: string }> {
  const res = await apiClient.get("/user/profile");
  return (res as any)?.data?.data ?? (res as any)?.data ?? {};
}
