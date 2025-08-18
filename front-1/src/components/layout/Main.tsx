import { PropsWithChildren } from "react";
export default function Main({ children }: PropsWithChildren) {
  return <main className="flex-1 overflow-auto">{children}</main>;
}
