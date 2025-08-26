
export const PATHS = {
    home: "/home",
    admin: "/admin",
    about: "/about",
    login: "/login",
    user: "/user",
    dashboard: "/dashboard",
    detailed: "/detailed",
    facilityKpiPage: "/facilitykpi",
    price: "/price",
    setting: "/setting",
    forbidden: "/403",
    notFound: "*",
} as const;


export type Role = "USER" | "SUPERVISOR";
export const roleHome = (r: Role) => {
//   console.log("=== roleHome 함수 디버깅 ===");
//   console.log("입력 role:", r);
//   console.log("PATHS.admin:", PATHS.admin);
//   console.log("PATHS.dashboard:", PATHS.dashboard);
  
  const result = r === "SUPERVISOR" ? PATHS.admin : PATHS.dashboard;
//   console.log("결과 경로:", result);
//   console.log("=============================");
  
  return result;
};
