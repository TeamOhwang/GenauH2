import { loginApi, logoutApi, fetchProfile } from "@/api/authApi";
import { authToken } from "@/api/apiClient";

// 서버 역할 → 프론트 역할 매핑 (기존 로직 유지: SUPERVISOR => ADMIN)
const mapServerRole = (serverRole?: string): "ADMIN" | "USER" | null => {
  if (!serverRole) return null;
  return serverRole.toUpperCase() === "SUPERVISOR" ? "ADMIN" : "USER";
};

// 로그인 + 토큰 저장 + 역할 동기화
export async function loginAndSyncRole(v: { email: string; password: string }) {
  const raw = await loginApi(v);
  const token = typeof raw === "string"
    ? raw.trim().replace(/^Bearer\s+/i, "")
    : String(raw ?? "").trim();

  authToken.set(token);
  const prof = await fetchProfile();
  return mapServerRole(prof.role); // "ADMIN" | "USER" | null
  
}

// 앱 시작 시(또는 새로고침) 역할 동기화
export async function syncRole(): Promise<"ADMIN" | "USER" | null> {
  const prof = await fetchProfile();
  return mapServerRole(prof.role);
}

// 로그아웃(서버 통지 후 토큰 정리)
export async function logoutAll(): Promise<void> {
  try {
    await logoutApi();
  } finally {
    authToken.clear();
  }
}
