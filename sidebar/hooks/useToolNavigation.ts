import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';

export function useToolNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 导航到工具详情页面
   * @param toolId 工具ID
   */
  const navigateToTool = useCallback((toolId: string) => {
    navigate(`/tool/${toolId}`);
  }, [navigate]);

  /**
   * 导航回工具列表页面
   */
  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  /**
   * 获取当前工具ID（如果在工具详情页面）
   * @returns 工具ID或null
   */
  const getCurrentToolId = useCallback((): string | null => {
    const match = location.pathname.match(/^\/tool\/(.+)$/);
    return match ? match[1] : null;
  }, [location.pathname]);

  /**
   * 检查当前路由是否为工具详情页面
   * @returns 是否在工具详情页面
   */
  const isToolRoute = useCallback((): boolean => {
    return location.pathname.startsWith('/tool/');
  }, [location.pathname]);

  /**
   * 检查当前路由是否为首页
   * @returns 是否在首页
   */
  const isHomeRoute = useCallback((): boolean => {
    return location.pathname === '/';
  }, [location.pathname]);

  return {
    navigateToTool,
    navigateToHome,
    getCurrentToolId,
    isToolRoute,
    isHomeRoute,
    currentPath: location.pathname
  };
} 