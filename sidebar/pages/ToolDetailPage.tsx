import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Settings, Power, Info } from 'lucide-react';
import { useToolManagement } from '@/sidebar/hooks/useToolManagement';

export function ToolDetailPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  
  const {
    enabledTools,
    isLoading,
    toggleTool,
    getToolById
  } = useToolManagement();

  const tool = toolId ? getToolById(toolId) : undefined;
  const isEnabled = toolId ? enabledTools[toolId] : false;

  const handleBack = () => {
    navigate('/');
  };

  const handleToggle = async () => {
    if (toolId) {
      try {
        await toggleTool(toolId);
      } catch (error) {
        console.error('切换工具状态失败:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto">
            <div className="w-full h-full border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-gray-300 rounded-lg"></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">工具未找到</h2>
            <p className="text-gray-500 mb-4">
              {toolId ? `工具 "${toolId}" 不存在或已被删除` : '未指定工具ID'}
            </p>
            <button 
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回工具列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = tool.icon;

  return (
    <div className="h-full bg-gray-50/30">
      {/* 简约顶部导航栏 */}
      <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">返回</span>
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center space-x-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${isEnabled ? 'bg-gray-100' : 'bg-gray-50 opacity-60'}
              `}>
                <IconComponent className={`w-5 h-5 ${isEnabled ? 'text-gray-700' : 'text-gray-400'}`} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">{tool.name}</h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${isEnabled 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-600'
    }
                  `}>
                    {isEnabled ? '已启用' : '已禁用'}
                  </span>
                  {tool.category && (
                    <span className="text-xs text-gray-400">{tool.category}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggle}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-xl border transition-colors text-sm font-medium
                ${isEnabled 
      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
    }
              `}
            >
              <Power className="w-4 h-4" />
              <span>{isEnabled ? '禁用' : '启用'}</span>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 工具详情内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 工具基本信息 */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6 space-y-4">
            <div className="flex items-start space-x-4">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center border border-gray-200/60
                ${isEnabled 
      ? 'bg-white shadow-sm' 
      : 'bg-gray-50 opacity-60'
    }
              `}>
                <IconComponent className={`w-8 h-8 ${isEnabled ? 'text-gray-700' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{tool.name}</h2>
                <p className="text-gray-600 mb-3 leading-relaxed">{tool.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  {tool.category && (
                    <span className="text-gray-500">
                      分类: <span className="font-medium text-gray-700">{tool.category}</span>
                    </span>
                  )}
                  {tool.version && (
                    <span className="text-gray-500">
                      版本: <span className="font-medium text-gray-700">v{tool.version}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 工具状态信息 */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-gray-600" />
              状态信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">当前状态</label>
                <p className={`text-sm font-medium ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {isEnabled ? '✓ 已启用' : '○ 已禁用'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">路由路径</label>
                <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg text-gray-700">
                  {tool.route}
                </p>
              </div>
            </div>
          </div>

          {/* 工具配置区域 */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-600" />
              工具配置
            </h3>
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium mb-1">配置功能开发中</p>
              <p className="text-xs">敬请期待更多个性化设置</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 