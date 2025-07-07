import { Outlet } from 'react-router';
import { ThemeToggle } from '../components/ThemeToggle';
import { Logo } from './header';

export function Layout() {
  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header - 固定高度 */}
      <header className="sticky top-0 h-16 flex-shrink-0 flex items-center justify-between px-4 shadow-lg shadow-background">
        <Logo />
        <ThemeToggle />
      </header>

      {/* Main - 滚动区域，占据剩余空间 */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
