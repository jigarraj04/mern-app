import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <nav className="drawer">
      <div className="drawer-brand">
        <span className="mark">RJ</span>
        <span className="sub">CRM</span>
      </div>

      <div className="drawer-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => (isActive ? "active" : "")}>
          Customers
        </NavLink>
        <NavLink to="/pipeline" className={({ isActive }) => (isActive ? "active" : "")}>
          Pipeline
        </NavLink>
      </div>

      <div className="drawer-foot">
        Filed &amp; up to date
        <br />
        v1.0
      </div>
    </nav>
  );
}
