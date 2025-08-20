export const PATHS = {
home: "/home",
admin: "/admin",
about: "/about",
login: "/login",
user: "/user",
daily: "/daily",
weekly: "/weekly",
monthly: "/monthly",
detailed: "/detailed",
price: "/price",
setting: "/setting",
forbidden: "/403",
notFound: "*",
} as const;

export type Role = "USER" | "ADMIN";
export const roleHome = (r: Role) => (r === "ADMIN" ? PATHS.admin : PATHS.daily);

