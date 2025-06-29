import { Outlet } from 'react-router';
import { Logo, Profile } from './header';

export function Layout() {
  return (
    <div className="h-full flex flex-col bg-primary">
      {/* Header - 固定高度 */}
      <header className="sticky top-0 h-16 flex-shrink-0 flex items-center justify-between text-gray-100 font-semibold px-4 shadow-lg shadow-primary">
        <Logo />
        <Profile />
      </header>

      {/* Main - 滚动区域，占据剩余空间 */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
