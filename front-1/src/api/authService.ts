import { loginApi, logoutApi, fetchProfile } from "@/api/authApi";
import { authToken } from "@/Stores/authStorage"; 

const mapServerRole = (serverRole?: string): "ADMIN" | "USER" | null =>
  !serverRole ? null : serverRole.toUpperCase() === "SUPERVISOR" ? "ADMIN" : "USER";

export async function loginAndSyncRole(v: { email: string; password: string }) {
  const raw = await loginApi(v);
  const token = (typeof raw === "string" ? raw : String(raw ?? ""))
    .trim()
    .replace(/^Bearer\s+/i, "");
  authToken.set(token);
  const prof = await fetchProfile();
  return mapServerRole(prof.role);
}

export async function syncRole(): Promise<"ADMIN" | "USER" | null> {
  const prof = await fetchProfile();
  return mapServerRole(prof.role);
}

export async function logoutAll(): Promise<void> {
  try { await logoutApi(); } finally { authToken.clear(); }
}
