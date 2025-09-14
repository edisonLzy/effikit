import { Outlet, useNavigate, useLocation } from 'react-router';
import { LogOut, User, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isConfigPage = location.pathname === '/config';

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
          <div className="flex items-center gap-1">
            {isConfigPage ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/')}
                className="h-8 w-8 p-0"
                title="返回主页"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/config')}
                className="h-8 w-8 p-0"
                title="配置"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 w-8 p-0"
              title="登出"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>
      )}
      
      {/* Main - 滚动区域，占据剩余空间 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}