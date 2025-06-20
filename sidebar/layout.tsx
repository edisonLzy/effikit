import { Outlet } from "react-router";

export function Layout() {
  return <div>
    <h1>Layout</h1>
    <Outlet />
  </div>;
}
