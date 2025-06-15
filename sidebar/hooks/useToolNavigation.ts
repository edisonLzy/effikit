import { useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';

export function useToolNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toolId } = useParams<{ toolId: string }>();
  
  const navigateToTool = useCallback((toolId: string) => {
    navigate(`/tool/${toolId}`);
  }, [navigate]);
  
  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);
  
  const getCurrentToolId = useCallback(() => {
    const match = location.pathname.match(/^\/tool\/(.+)$/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const isToolRoute = useCallback(() => {
    return location.pathname.startsWith('/tool/');
  }, [location.pathname]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);
  
  return {
    navigateToTool,
    navigateToHome,
    getCurrentToolId,
    isToolRoute,
    goBack,
    goForward,
    currentPath: location.pathname,
    currentToolId: toolId
  };
} 