import { postD } from "@/api/apiClient";
import { useAuthStore } from "@/Stores/useAuthStore";

export interface LoginReq {
  email: string;
  password: string;
}

export interface Me {
  id: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

// 백엔드 응답: { success, token, user?, message? }
type LoginRes = {
  success: boolean;
  token?: string;
  user?: Me;
  message?: string;
};

export async function login(body: LoginReq): Promise<string> {
  const res = await postD<LoginRes>("/user/login", body); 
  if (!res?.success || !res.token) {
    throw new Error(res?.message || "로그인 실패");
  }
  useAuthStore.getState().loginWithToken(res.token);
  // (선택) user.role을 스토어에 직접 반영하고 싶다면 setRole 추가해서 여기서 반영
  return res.token;
}

export async function logout(): Promise<void> {
  try {
    await postD<void>("/user/logout"); 
  } finally {
    useAuthStore.getState().logout(); 
  }
}
