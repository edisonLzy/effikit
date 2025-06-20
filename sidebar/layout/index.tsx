import { Outlet } from "react-router";
import { Logo, Profile } from "./header";

export function Layout() {
  return (
    <div className="h-full flex flex-col">
      {/* Header - 固定高度 */}
      <header className="h-16 bg-blue-500 flex items-center justify-between text-white font-semibold px-4">
        <Logo />
        <Profile />
      </header>

      {/* Main - 滚动区域，占据剩余空间 */}
      <main className="flex-1 bg-gray-100">
          <Outlet />
      </main>
    </div>
  );
}
