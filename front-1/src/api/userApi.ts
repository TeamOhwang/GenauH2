import apiClient from "@/api/apiClient";

export const USER_ENDPOINTS = {
    verifyPassword: "/user/verify-password",
    changePassword: "/user/change-password",
    getNotificationSettings: "/user/notification-settings",
    updateNotificationSettings: "/user/notification-settings",
}

// 비밀번호 확인
export async function verifyPasswordApi(password: string) {
    const res = await apiClient.post(USER_ENDPOINTS.verifyPassword, { password });
    return (res as any)?.data?.data ?? (res as any)?.data ?? null;
}

export async function changePasswordApi(password: string) {
    const res = await apiClient.post(USER_ENDPOINTS.changePassword, { password });
    return (res as any)?.data?.data ?? (res as any)?.data ?? null;
}

export async function getNotificationSettingsApi() {
    const res = await apiClient.get(USER_ENDPOINTS.getNotificationSettings);
    return (res as any)?.data?.data ?? (res as any)?.data ?? null;
}