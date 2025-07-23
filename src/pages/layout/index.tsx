import { Outlet } from "react-router";
import Haderbar from "./compment/haderbar";
import Sidebar from "./compment/sidebar";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-full">
      <Haderbar />
      <div className="flex md:flex-row">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
}
