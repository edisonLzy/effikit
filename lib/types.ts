import type { LucideIcon } from 'lucide-react';

// 工具接口
export interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: LucideIcon;
  category?: string;
  version?: string;
  lastUpdated?: Date;
  route: string; // 工具对应的路由路径
  component?: React.ComponentType; // 工具对应的组件
}

// 工具设置接口
export interface ToolSettings {
  [toolId: string]: boolean;
}

// 搜索状态接口
export interface SearchState {
  term: string;
  results: Tool[];
  isSearching: boolean;
}

// 路由配置接口
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  toolId?: string;
}

// 导航状态接口
export interface NavigationState {
  currentRoute: string;
  previousRoute?: string;
  history: string[];
}

// Chrome存储接口
export interface EffikitSettings {
  toolSettings: ToolSettings;
  navigationHistory: string[];
  lastActiveToolId?: string;
} 