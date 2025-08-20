import apiClient, { AUTH_ENDPOINTS, unwrap } from "@/api/apiClient";

export type LoginReq = { email: string; password: string };

const normalizeToken = (t: unknown): string | null => {
  if (!t) return null;
  const s = String(t).trim();
  return s ? s.replace(/^Bearer\s+/i, "") : null;
};

export async function loginApi(body: LoginReq): Promise<string> {
  const res = await apiClient.post(AUTH_ENDPOINTS.login, body);
  const u = unwrap<any>(res); 
  const raw = typeof u === "string" ? u : u?.accessToken ?? u?.token;
  const token = normalizeToken(raw);
  if (!token) throw new Error("토큰이 없습니다.");
  return token; 
}

export async function logoutApi(): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.logout, {});
}

export async function fetchProfile(): Promise<{ role?: string }> {
  const res = await apiClient.get(AUTH_ENDPOINTS.profile);
  return unwrap<{ role?: string }>(res) ?? {};
}
