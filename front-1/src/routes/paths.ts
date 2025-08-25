

export const PATHS = {
  home: "/home",
  admin: "/admin",
  about: "/about",
  login: "/login",
  user: "/user",
  dashboard: "/dashboard",
  detailed: "/detailed",
  hydrogenPage: "/HydrogenPage",
  price: "/price",
  setting: "/setting",
  forbidden: "/403",
  notFound: "*",
} as const;

export type Role = "USER" | "ADMIN";
export const roleHome = (r: Role) => (r === "ADMIN" ? PATHS.admin : PATHS.dashboard);
