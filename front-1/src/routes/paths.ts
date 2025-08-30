import FacilityPage from "@/pages/FacilityPage";

export const PATHS = {
    home: "/home",
    admin: "/admin",
    about: "/about",
    login: "/login",
    user: "/user",
    dashboard: "/dashboard",
    detailed: "/detailed",
    facilityPage: "/facilityPage",
    equipmentList: "/equipmentList",
    price: "/price",
    setting: "/setting",
    test: "/test", // 테스트 페이지 추가
    changePassword: "/changePassword", // 비밀번호 변경 (일반 모드 + 리셋 모드 통합)
    requestJoin: "/requestJoin",
    websocketTest: "/websocket-test", // WebSocket 테스트 페이지
    notificationLog: "/notification-log", // 알림 로그 페이지
    forbidden: "/403",
    notFound: "*",
} as const;

export type Role = "USER" | "SUPERVISOR";
export const roleHome = (r: Role) => {
    const result = r === "SUPERVISOR" ? PATHS.admin : PATHS.dashboard;
    return result;
};