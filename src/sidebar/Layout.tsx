import { Outlet } from 'react-router';

export function Layout() {
  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Main - 滚动区域，占据剩余空间 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}