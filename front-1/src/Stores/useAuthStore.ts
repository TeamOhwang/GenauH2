import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { authToken, ACCESS_TOKEN_KEY } from "./authStorage";
import { AuthApi } from "@/api/authApi";

export type Role = "USER" | "ADMIN" | null;
type JWTPayload = { role?: string; userId?: number; email?: string };

const decodeRole = (t: string | null): Role => {
  try {
    const p = jwtDecode<JWTPayload>(t!);
    return p.role === "ADMIN" ? "ADMIN" : p.role === "USER" ? "USER" : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<{
  role: Role;
  userId: number | null;
  email: string | null;
  isInit: boolean;
  setRole: (r: Role) => void;
  setUserId: (id: number | null) => void;
  setEmail: (e: string | null) => void;
  init: () => Promise<void>;
  logout: () => void;
}>((set) => ({
  role: decodeRole(authToken.get()),
  userId: null,
  email: null,
  isInit: false,
  setRole: (r) => set({ role: r }),
  setUserId: (id) => set({ userId: id }),
  setEmail: (e) => set({ email: e }),
  init: async () => {
    const t = authToken.get();
    set({ role: decodeRole(t), isInit: true });
  },
  logout: () => {
    AuthApi.logoutAll();
    set({ role: null, userId: null, email: null, isInit: true });
  },
}));
