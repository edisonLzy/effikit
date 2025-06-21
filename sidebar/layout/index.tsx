import { Outlet } from "react-router";
import { Logo, Profile } from "./header";

export function Layout() {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header - 固定高度 */}
      <header className="h-16 bg-gray-800 flex-shrink-0 flex items-center justify-between text-gray-100 font-semibold px-4 border-b border-gray-700">
        <Logo />
        <Profile />
      </header>

      {/* Main - 滚动区域，占据剩余空间 */}
      <main className="flex-1 bg-gray-900">
          <Outlet />
      </main>
    </div>
  );
}
