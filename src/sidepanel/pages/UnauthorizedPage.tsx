import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from '../components/AuthForm';

export function UnauthorizedPage() {
  const { user, isLoading } = useAuth();

  // 如果用户已认证，重定向到主页
  if (user) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      <div className="relative z-10 w-full max-w-md mx-auto px-4">        
        <AuthForm />
        
        {/* 底部提示 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            登录后您的高亮数据将自动同步到云端
          </p>
        </div>
      </div>
    </div>
  );
}