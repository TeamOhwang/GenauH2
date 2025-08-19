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
//추가로 페이지 늘릴 때는 paths.ts에 경로 추가하고 AppRoutes.tsx에 <Route />만 한 줄 더 넣으면 끝