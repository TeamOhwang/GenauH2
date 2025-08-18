import { NavLink } from "react-router-dom";
import { PATHS } from "@/routes/paths";

export default function Header() {
  return (
    <header className="flex flex-row justify-between items-center bg-white p-3">
      <span className="ml-6 text-2xl font-bold text-blue-600">GenauH2</span>
      <span className="ml-auto mr-4 font-semibold text-gray-600">UserEamil@test.com</span>
    </header>
  );
}
