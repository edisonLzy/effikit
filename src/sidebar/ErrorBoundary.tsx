import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { AlertTriangle, Home, Zap } from 'lucide-react';

export function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: string | number = '错误';

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data?.message || error.statusText || '发生了未知错误';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = '发生了未知错误';
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* 主要内容区域 */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* 错误状态码或图标 */}
        <div className="mb-6">
          {errorStatus === 404 ? (
            <div className="text-6xl font-bold text-red-400">404</div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
          )}
        </div>
        
        {/* 错误标题 */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            系统错误
          </h1>
          <p className="text-xl text-muted-foreground">
            {errorStatus === 404 ? '页面未找到' : '应用程序错误'}
          </p>
        </div>
        
        {/* 错误描述 */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-4">
            {errorStatus === 404 
              ? '您访问的页面不存在'
              : '系统遇到了意外故障，正在尝试修复'
            }
          </p>
          
          {errorStatus !== 404 && (
            <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">错误详情</span>
              </div>
              <p className="text-sm text-red-200 font-mono break-all text-left">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex justify-center">
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}