import { Link, useNavigate } from 'react-router';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* 404 文字 */}
          <div className="text-6xl font-bold text-foreground leading-none">
            4
          </div>
          
          {/* 中间图标 */}
          <div className="flex flex-col items-center">
            <div className="p-4 bg-muted rounded-full">
              <FileQuestion className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
          
          <div className="text-6xl font-bold text-foreground leading-none">
            4
          </div>
        </div>
        
        {/* OOPS! 文字 */}
        <div className="mb-4">
          <h1 className="text-5xl font-medium text-foreground mb-2">OOPS!</h1>
          <p className="text-3xl font-light text-muted-foreground">
            页面未找到
          </p>
        </div>
        
        {/* 按钮组 */}
        <div className="flex gap-4 justify-center mt-8">
          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Link>
          
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上页
          </button>
        </div>
      </div>
    </div>
  );
}