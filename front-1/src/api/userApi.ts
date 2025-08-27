import apiClient from "@/api/apiClient";

export const USER_ENDPOINTS = {
    requestPasswordRest: "/user/request-password-reset",
    getNotificationSettings: "/user/notification-settings",
    updateNotificationSettings: "/user/notification-settings",
}

// 비밀번호 리셋 요청
export async function requestPasswordResetApi() {
    const res = await apiClient.post(USER_ENDPOINTS.requestPasswordRest);
    return res.data.success;
}

// 알림 설정 조회
export async function getNotificationSettingsApi() {
    const res = await apiClient.get(USER_ENDPOINTS.getNotificationSettings);
    return (res as any)?.data?.data ?? (res as any)?.data ?? null;
}

// 알림 설정 수정
export async function updateNotificationSettingsApi(settings: any) {
    const res = await apiClient.patch(USER_ENDPOINTS.updateNotificationSettings, settings);
    return (res as any)?.data?.data ?? (res as any)?.data ?? null;
}