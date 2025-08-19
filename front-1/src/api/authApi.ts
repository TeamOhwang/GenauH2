import apiClient, { API_BASE_URL, PATHS, authToken } from "@/api/apiClient";

export type LoginReq = { email: string; password: string };

export async function login(body: LoginReq): Promise<void> {
  // 절대 URL로 호출 (프리픽스 보호)
  const res = await apiClient.post(`${API_BASE_URL}${PATHS.login}`, body, {
    withCredentials: true, // 서버가 Refresh 쿠키를 내려줄 수 있음
  });

  // 서버가 { data: { accessToken } } 또는 { accessToken } 형태 모두 지원
  const token: unknown =
    (res as any)?.data?.data?.accessToken ?? (res as any)?.data?.accessToken;

  if (typeof token === "string" && token.length > 0) {
    // 즉시 사용 가능하도록 accessToken 저장
    authToken.set(token);
  }
}

export async function logout(): Promise<void> {
  try {
    // 서버 로그아웃(세션/쿠키 정리)
    await apiClient.post(`${API_BASE_URL}${PATHS.logout}`, {}, { withCredentials: true });
  } finally {
    // 클라이언트 토큰 정리 및 /login 이동
    authToken.clear();
  }
}
