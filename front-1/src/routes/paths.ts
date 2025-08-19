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


export const ROLE_HOME: Record<"USER" | "ADMIN", string> = {
USER: PATHS.home,
ADMIN: PATHS.admin,
};