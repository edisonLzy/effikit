import { Link } from 'react-router';
import { Lock, LogIn, Home } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* 锁图标 */}
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-yellow-500/20 rounded-full">
            <Lock className="w-16 h-16 text-yellow-400" />
          </div>
        </div>
        
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            需要登录
          </h1>
          <p className="text-xl text-muted-foreground">
            访问此功能需要登录账户
          </p>
        </div>
        
        {/* 描述 */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-4">
            登录后您可以享受云端同步、数据备份等高级功能
          </p>
        </div>

        {/* 按钮组 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <LogIn className="w-4 h-4 mr-2" />
            立即登录
          </button>
          
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>
        
        {/* 底部提示 */}
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">
            暂时可以使用本地功能，但无法享受云端同步服务
          </p>
        </div>
      </div>
    </div>
  );
}