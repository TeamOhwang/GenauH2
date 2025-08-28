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
    changePassword: "/changePassword", // 비밀번호 변경 (일반 모드 + 리셋 모드 통합)
    forbidden: "/403",
    notFound: "*",
} as const;

export type Role = "USER" | "SUPERVISOR";
export const roleHome = (r: Role) => {
    const result = r === "SUPERVISOR" ? PATHS.admin : PATHS.dashboard;
    return result;
};