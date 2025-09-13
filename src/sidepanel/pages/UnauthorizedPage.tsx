import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router';

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
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            登录 EffiKit
          </h1>
          <p className="text-muted-foreground">
            登录后即可享受云端同步功能
          </p>
        </div>
        
        {/* Supabase Auth UI */}
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  borderRadius: '6px',
                  fontSize: '14px',
                  padding: '8px 16px',
                },
                input: {
                  borderRadius: '6px',
                  fontSize: '14px',
                  padding: '8px 12px',
                },
                container: {
                  gap: '16px',
                },
                message: {
                  fontSize: '14px',
                  marginBottom: '8px',
                }
              },
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    brandButtonText: 'hsl(var(--primary-foreground))',
                    defaultButtonBackground: 'hsl(var(--secondary))',
                    defaultButtonBackgroundHover: 'hsl(var(--secondary)/80)',
                    defaultButtonBorder: 'hsl(var(--border))',
                    defaultButtonText: 'hsl(var(--secondary-foreground))',
                    dividerBackground: 'hsl(var(--border))',
                    inputBackground: 'hsl(var(--background))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--primary))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    inputText: 'hsl(var(--foreground))',
                    inputPlaceholder: 'hsl(var(--muted-foreground))',
                  }
                }
              }
            }}
            theme="light"
            providers={['google', 'github']}
            redirectTo={window.location.origin}
            onlyThirdPartyProviders={false}
            magicLink={false}
            showLinks={true}
            localization={{
              variables: {
                sign_up: {
                  email_label: '邮箱',
                  password_label: '密码',
                  email_input_placeholder: '请输入邮箱',
                  password_input_placeholder: '请输入密码',
                  button_label: '注册',
                  loading_button_label: '注册中...',
                  social_provider_text: '使用 {{provider}} 注册',
                  link_text: '还没有账户？注册一个',
                  confirmation_text: '请检查您的邮箱确认注册'
                },
                sign_in: {
                  email_label: '邮箱',
                  password_label: '密码',
                  email_input_placeholder: '请输入邮箱',
                  password_input_placeholder: '请输入密码',
                  button_label: '登录',
                  loading_button_label: '登录中...',
                  social_provider_text: '使用 {{provider}} 登录',
                  link_text: '已有账户？立即登录'
                },
                magic_link: {
                  email_input_label: '邮箱',
                  email_input_placeholder: '请输入邮箱',
                  button_label: '发送魔法链接',
                  loading_button_label: '发送中...',
                  link_text: '发送魔法链接',
                  confirmation_text: '请检查您的邮箱中的魔法链接'
                },
                forgotten_password: {
                  email_label: '邮箱',
                  email_input_placeholder: '请输入邮箱',
                  button_label: '发送重置密码邮件',
                  loading_button_label: '发送中...',
                  link_text: '忘记密码？',
                  confirmation_text: '请检查您的邮箱重置密码'
                },
                update_password: {
                  password_label: '新密码',
                  password_input_placeholder: '请输入新密码',
                  button_label: '更新密码',
                  loading_button_label: '更新中...',
                  confirmation_text: '密码更新成功'
                }
              }
            }}
          />
        </div>
        
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