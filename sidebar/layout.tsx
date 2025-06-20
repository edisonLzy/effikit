import { Outlet } from "react-router";

export function Layout() {
  return (
    <div className="h-full flex flex-col">
      {/* Header - 固定高度 */}
      <header className="h-16 bg-blue-500 flex items-center justify-center text-white font-semibold">
        Header
      </header>

      {/* Main - 滚动区域，占据剩余空间 */}
      <main className="flex-1 bg-gray-100 overflow-y-auto">
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      {/* Footer - 固定高度，始终在底部 */}
      <footer className="h-12 bg-green-500 flex items-center justify-center text-white font-semibold">
        Footer
      </footer>
    </div>
  );
}
