import React, { useState } from 'react';
import { Plus, Trash2, Save, Edit, Eye, EyeOff } from 'lucide-react';
import type { DifyWorkflow, DifyConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGlobalConfig } from '@/hooks/useGlobalConfig';
import { DifyService } from '@/services/difyService';

export function ConfigPage() {
  const { getFeatureConfig, setFeatureConfig, isLoading } = useGlobalConfig();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<DifyWorkflow | null>(null);
  const [formData, setFormData] = useState<Partial<DifyWorkflow>>({
    key: '',
    title: '',
    apiKey: ''
  });
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  // 获取当前的 Dify 配置
  const rawDifyConfig = getFeatureConfig('dify');
  const difyConfig: DifyConfig = (rawDifyConfig && typeof rawDifyConfig === 'object' && 'workflows' in rawDifyConfig)
    ? rawDifyConfig as DifyConfig
    : { workflows: [] };

  const handleAddWorkflow = () => {
    setEditingWorkflow(null);
    setFormData({ key: '', title: '', apiKey: '' });
    setIsDialogOpen(true);
  };

  const handleEditWorkflow = (workflow: DifyWorkflow) => {
    setEditingWorkflow(workflow);
    setFormData({ ...workflow });
    setIsDialogOpen(true);
  };

  const handleSaveWorkflow = async () => {
    if (!formData.key || !formData.title || !formData.apiKey) {
      alert('请填写所有必需字段');
      return;
    }

    const workflow: DifyWorkflow = {
      key: formData.key,
      title: formData.title,
      apiKey: formData.apiKey
    };

    // 验证工作流配置
    setIsValidating(true);
    try {
      const isValid = await DifyService.validateWorkflow(workflow);
      if (!isValid) {
        alert('工作流验证失败，请检查 API_KEY 是否正确');
        setIsValidating(false);
        return;
      }
    } catch (error) {
      console.error('Workflow validation error:', error);
      alert(`工作流验证失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsValidating(false);
      return;
    }
    setIsValidating(false);

    let updatedWorkflows: DifyWorkflow[];

    if (editingWorkflow) {
      // 编辑现有工作流
      updatedWorkflows = difyConfig.workflows.map(w =>
        w.key === editingWorkflow.key ? workflow : w
      );
    } else {
      // 添加新工作流，检查 key 是否重复
      const existingWorkflow = difyConfig.workflows.find(w => w.key === workflow.key);
      if (existingWorkflow) {
        alert('工作流 Key 已存在，请使用不同的 Key');
        return;
      }
      updatedWorkflows = [...difyConfig.workflows, workflow];
    }

    try {
      await setFeatureConfig('dify', { workflows: updatedWorkflows });
      setIsDialogOpen(false);
      setFormData({ key: '', title: '', apiKey: '' });
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('保存配置失败');
    }
  };

  const handleDeleteWorkflow = async (workflow: DifyWorkflow) => {
    if (!confirm(`确定要删除工作流 "${workflow.title}" 吗？`)) {
      return;
    }

    const updatedWorkflows = difyConfig.workflows.filter(w => w.key !== workflow.key);

    try {
      await setFeatureConfig('dify', { workflows: updatedWorkflows });
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('删除配置失败');
    }
  };

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKey(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskApiKey = (apiKey: string): string => {
    if (apiKey.length <= 8) {
      return apiKey;
    }
    return apiKey.substring(0, 4) + '••••••••' + apiKey.substring(apiKey.length - 4);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">扩展配置</h1>
      </div>

      <Tabs defaultValue="dify" className="w-full">
        <TabsList>
          <TabsTrigger value="dify">Dify 工作流</TabsTrigger>
          {/* 预留其他配置标签页 */}
        </TabsList>

        <TabsContent value="dify" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">工作流配置</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加工作流
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingWorkflow ? '编辑工作流' : '添加工作流'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-key">工作流 Key</Label>
                    <Input
                      id="workflow-key"
                      value={formData.key || ''}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="唯一标识符，如: save-to-feishu"
                      disabled={!!editingWorkflow} // 编辑时不允许修改 key
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-title">工作流名称</Label>
                    <Input
                      id="workflow-title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="如: 保存内容到飞书"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-apikey">API Key</Label>
                    <Input
                      id="workflow-apikey"
                      type="password"
                      value={formData.apiKey || ''}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="输入 Dify 工作流的 API Key"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isValidating}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleSaveWorkflow}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        '验证中...'
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          保存
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {difyConfig.workflows.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 text-center">
                  暂无配置的工作流
                  <br />
                  点击"添加工作流"开始配置
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {difyConfig.workflows.map((workflow) => (
                <Card key={workflow.key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{workflow.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditWorkflow(workflow)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWorkflow(workflow)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Key:</span>{' '}
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {workflow.key}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600">API Key:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs flex-1">
                          {showApiKey[workflow.key] ? workflow.apiKey : maskApiKey(workflow.apiKey)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleApiKeyVisibility(workflow.key)}
                          className="h-6 w-6 p-0"
                        >
                          {showApiKey[workflow.key] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}