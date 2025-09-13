import React, { useState } from 'react';
import { GitBranch, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/config/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// OAuth登录表单组件
function OAuthForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      
      <Button
        onClick={handleGitHubAuth}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GitBranch className="mr-2 h-4 w-4" />
        )}
        使用 GitHub 登录
      </Button>
    </div>
  );
}

// 密码认证表单组件
function PasswordAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMode, setPasswordMode] = useState<'signin' | 'signup'>('signin');
  const [formState, setFormState] = useState<'form' | 'forgot-password' | 'reset-success' | 'signup-success'>('form');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6位');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setFormState('signup-success');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setFormState('reset-success');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '发送重置邮件失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (mode: 'signin' | 'signup') => {
    setPasswordMode(mode);
    setFormState('form');
    resetForm();
  };

  const handleBackToForm = () => {
    setFormState('form');
    resetForm();
  };

  // 注册成功状态
  if (formState === 'signup-success') {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-md bg-green-50 border border-green-200">
          <h3 className="text-lg font-medium text-green-800 mb-2">注册成功！</h3>
          <p className="text-sm text-green-600 mb-4">
            我们已向您的邮箱发送了确认邮件，请点击邮件中的链接完成账户激活。
          </p>
          <Button
            onClick={handleBackToForm}
            variant="outline"
            size="sm"
          >
            返回登录
          </Button>
        </div>
      </div>
    );
  }

  // 重置密码成功状态
  if (formState === 'reset-success') {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-md bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-medium text-blue-800 mb-2">邮件已发送</h3>
          <p className="text-sm text-blue-600 mb-4">
            如果该邮箱已注册，您将收到密码重置邮件。请查看您的邮箱并按照说明操作。
          </p>
          <Button
            onClick={handleBackToForm}
            variant="outline"
            size="sm"
          >
            返回登录
          </Button>
        </div>
      </div>
    );
  }

  // 忘记密码表单
  if (formState === 'forgot-password') {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">邮箱</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="请输入注册邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-3">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              发送重置邮件
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToForm}
              className="w-full"
            >
              返回登录
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // 主表单
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      
      {passwordMode === 'signin' ? (
        <div className="space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">邮箱</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">密码</Label>
                <button
                  type="button"
                  onClick={() => setFormState('forgot-password')}
                  className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  忘记密码？
                </button>
              </div>
              <Input
                id="signin-password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              登录
            </Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            还没有账号？
            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              className="ml-1 text-foreground underline-offset-4 hover:underline"
            >
              注册账号
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">邮箱</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">密码</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="请输入密码 (至少6位)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认密码</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              注册
            </Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            已有账号？
            <button
              type="button"
              onClick={() => handleModeSwitch('signin')}
              className="ml-1 text-foreground underline-offset-4 hover:underline"
            >
              立即登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuthForm() {
  const { error } = useAuth();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">登录 EffiKit</CardTitle>
        <CardDescription>登录后即可享受云端同步功能</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}
        
        {/* OAuth 登录区域 */}
        <OAuthForm />
        
        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">或</span>
          </div>
        </div>
        
        {/* 邮箱密码登录区域 */}
        <PasswordAuthForm />
      </CardContent>
    </Card>
  );
}