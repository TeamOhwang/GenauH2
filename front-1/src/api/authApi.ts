
import { postD, getD } from "@/api/apiClient";
import { useAuthStore } from "@/Stores/useAuthStore";

export interface LoginReq {
  email: string;
  password: string;
}

type LoginRes = { accessToken: string } | string;

export interface Me {
  id: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

function extractAccessToken(res: LoginRes): string | null {
  return typeof res === "string" ? (res || null) : (res?.accessToken ?? null);
}

export async function login(body: LoginReq): Promise<string> {
  const data = await postD<LoginRes>("/auth/login", body);
  const token = extractAccessToken(data);
  if (!token) throw new Error("No accessToken from /auth/login");
  useAuthStore.getState().loginWithToken(token);
  return token;
}

export async function logout(): Promise<void> {
  try {
    await postD<void>("/auth/logout");
  } finally {
    useAuthStore.getState().logout();
  }
}

export function fetchMe() {
  return getD<Me>("/users/me");
}
