import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  signOut: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // 获取初始会话状态
    const getInitialSession = async () => {
      try {
        // 首先尝试从 Chrome 存储中获取会话
        const result = await chrome.storage.local.get(['effikit_auth']);
        const authData = result.effikit_auth;
        
        if (authData && authData.access_token && authData.refresh_token) {
          // 设置 Supabase 会话
          const { data, error } = await supabase.auth.setSession({
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
          });
          
          if (!error && data.user) {
            setUser(data.user);
            setIsLoading(false);
            return;
          }
          
          // 如果会话过期，清除存储的认证数据
          if (error) {
            await chrome.storage.local.remove(['effikit_auth']);
          }
        }
        
        // 如果没有存储的会话或会话无效，尝试获取当前会话
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setError(error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        setError(err as AuthError);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setError(null);
        setIsLoading(false);

        // 保存或清除会话到 Chrome 存储
        if (session?.access_token && session?.refresh_token) {
          await chrome.storage.local.set({
            'effikit_auth': {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              user: session.user
            }
          });
        } else {
          await chrome.storage.local.remove(['effikit_auth']);
        }

        // 可以在这里处理不同的认证事件
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
          default:
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error);
        throw error;
      }
      
      // 清除 Chrome 存储中的认证数据
      await chrome.storage.local.remove(['effikit_auth']);
    } catch (err) {
      setError(err as AuthError);
      throw err;
    }
  };

  const signInWithGitHub = async () => {
    try {
      setError(null);

      // 获取 OAuth URL
      const redirectTo = chrome.identity.getRedirectURL();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo,
        },
      });

      if (error) {
        setError(error);
        throw error;
      }

      if (!data.url) {
        throw new Error('未能获取认证 URL');
      }

      // 使用 Chrome Identity API 进行认证
      const redirectUrl = await chrome.identity.launchWebAuthFlow({
        url: data.url,
        interactive: true,
      });

      if (!redirectUrl) {
        throw new Error('认证被用户取消');
      }

      // 解析重定向 URL 中的认证参数
      const urlObj = new URL(redirectUrl);
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (!accessToken || !refreshToken) {
        throw new Error('认证响应中缺少必要的令牌');
      }

      // 设置 Supabase 会话
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        setError(sessionError);
        throw sessionError;
      }

      if (sessionData.session) {
        console.log('GitHub OAuth 认证成功');

        // 保存会话到本地存储
        await chrome.storage.local.set({
          'effikit_auth': {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: sessionData.user
          }
        });
      }

    } catch (err) {
      setError(err as AuthError);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error);
        throw error;
      }
    } catch (err) {
      setError(err as AuthError);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setError(error);
        throw error;
      }
    } catch (err) {
      setError(err as AuthError);
      throw err;
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      
      if (error) {
        setError(error);
        throw error;
      }
    } catch (err) {
      setError(err as AuthError);
      throw err;
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signOut,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    resetPasswordForEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}