import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Search, Globe, Activity, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useRequestInterceptor } from './useRequestInterceptor';
import { MockDataDialog } from './MockDataDialog';
import type { HttpRequest } from './types';

export function RequestInterceptor() {
  const {
    requests,
    searchTerm,
    filteredRequests,
    selectedRequest,
    isDialogOpen,
    toggleIntercept,
    updateMockData,
    handleSearch,
    openMockDialog,
    closeMockDialog
  } = useRequestInterceptor();

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getStatusIcon = (request: HttpRequest) => {
    if (request.isMocked) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (request.isIntercepted) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-background">
      {/* 工具标题 */}
      <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
        <Globe className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-semibold">HTTP请求拦截器</h1>
      </div>

      {/* 搜索栏 */}
      <div className="p-4 border-b bg-background">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索URL或请求方法..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 请求列表区域 */}
      <div className="flex-1 overflow-auto">
        {/* 列表头部 */}
        <div className="sticky top-0 bg-muted/20 border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="w-4 h-4" />
              <span>请求列表</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredRequests.length} 个请求
            </Badge>
          </div>
        </div>

        {/* 请求列表内容 */}
        <div className="divide-y">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-medium text-muted-foreground mb-1">暂无HTTP请求记录</h3>
              <p className="text-xs text-muted-foreground/70">浏览网页时请求将自动出现在这里</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* 方法和状态指示器 */}
                    <div className="flex items-center gap-2">
                      <Badge className={`${getMethodColor(request.method)} text-xs font-mono`} variant="secondary">
                        {request.method}
                      </Badge>
                      {getStatusIcon(request)}
                      {request.isMocked && (
                        <Badge variant="default" className="text-xs bg-primary/10 text-primary">
                          已Mock
                        </Badge>
                      )}
                    </div>
                    
                    {/* URL */}
                    <p className="text-sm font-medium text-foreground/90 break-all" title={request.url}>
                      {request.url}
                    </p>
                    
                    {/* 时间戳 */}
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* 操作区域 */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* 拦截开关 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">拦截</span>
                                             <Switch
                         checked={request.isIntercepted}
                         onCheckedChange={(checked) => toggleIntercept(request.id, checked)}
                       />
                    </div>
                    
                    {/* Mock编辑按钮 */}
                    {request.isIntercepted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMockDialog(request)}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        title="编辑Mock响应"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 测试区域 */}
      <div className="border-t bg-muted/20 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>测试请求</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // 发起测试请求
                fetch('https://jsonplaceholder.typicode.com/posts/1')
                  .then(response => response.json())
                  .then(data => console.log('Test GET request completed:', data))
                  .catch(error => console.error('Test GET request failed:', error));
              }}
              className="text-xs"
            >
              测试 GET 请求
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // 发起测试 POST 请求
                fetch('https://jsonplaceholder.typicode.com/posts', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    title: 'Test Post',
                    body: 'This is a test post from EffiKit',
                    userId: 1
                  })
                })
                  .then(response => response.json())
                  .then(data => console.log('Test POST completed:', data))
                  .catch(error => console.error('Test POST failed:', error));
              }}
              className="text-xs"
            >
              测试 POST 请求
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            点击测试按钮生成示例请求，用于验证拦截功能是否正常工作。
          </p>
        </div>
      </div>

      {/* Mock数据编辑弹窗 */}
      <MockDataDialog
        isOpen={isDialogOpen}
        onClose={closeMockDialog}
        request={selectedRequest}
        onSave={updateMockData}
      />
    </div>
  );
} 