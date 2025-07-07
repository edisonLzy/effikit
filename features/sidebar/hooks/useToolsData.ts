import { useMemo } from 'react';
import { toolRoutes } from '../routes';

export interface Tool {
  label: string;
  icon: string;
  description: string;
  path: string;
}

export function useToolsData() {
  // 将路由数据转换为Tool格式
  const tools = useMemo(() => {
    return toolRoutes.map(route => ({
      label: route.handle?.label ?? 'Empty',
      icon: route.handle?.icon ?? '🤔',
      description: route.handle?.description ?? 'Empty',
      path: `/tool/${route.path}`,
    } as Tool));
  }, []);

  return {
    tools,
  };
} 