import { NavLink } from "react-router-dom";
import { PATHS } from "@/routes/paths";

export default function Header() {
  return (
    <header>
      <nav>
        <NavLink to={PATHS.home}>Home</NavLink>{" | "}
        <NavLink to={PATHS.about}>About</NavLink>
      </nav>
    </header>
  );
}
