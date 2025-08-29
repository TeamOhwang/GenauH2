import { PropsWithChildren } from "react";
export default function Main({ children }: PropsWithChildren) {
  return <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors scrollbar-hide">{children}</main>;
}
