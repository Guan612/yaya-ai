import Drawerbar from "./drawerbar";

export default function Haderbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-none">
        <div className="drawer md:hidden">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* Page content here */}
            <label
              htmlFor="my-drawer"
              className="btn btn-primary drawer-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>{" "}
              </svg>
            </label>
          </div>
          <Drawerbar />
        </div>
      </div>
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">鸭鸭ai</a>
      </div>
      <div className="flex-none"></div>
    </div>
  );
}
