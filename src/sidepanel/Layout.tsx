import { Outlet } from 'react-router';
import { LogOut, User } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Layout() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header - 用户信息和登出 */}
      {user && (
        <header className="flex items-center justify-between p-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-32">
              {user.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 w-8 p-0"
            title="登出"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </header>
      )}
      
      {/* Main - 滚动区域，占据剩余空间 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}