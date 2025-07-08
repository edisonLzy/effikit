import React, { useState, useEffect, useCallback } from 'react';
import { Save, Code, AlertTriangle, Wand2, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { useForm, Controller } from 'react-hook-form';
import { useBellaConfig } from './ConfigModal';
import type { CapturedHttpRequest } from './types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';

interface MockDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: CapturedHttpRequest | null;
  onSave: (requestId: string, mockData: string) => void;
}

interface AIGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: string) => void;
  requestInfo?: {
    method: string;
    url: string;
  };
}

interface AIFormData {
  url: string;
  token: string;
  prompt?: string;
}

function AIGenerateDialog(props: AIGenerateDialogProps) {
  const { isOpen, onClose, onGenerate, requestInfo } = props;
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const { config: bellaConfig } = useBellaConfig();
  const { toast } = useToast();

  // 使用 react-hook-form 管理表单状态
  const { 
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<AIFormData>({
    mode: 'onChange'
  });

  const handleClose = useCallback(() => {
    reset();
    setApiError('');
    setIsGenerating(false);
    onClose();
  }, [onClose, reset]);

  const onSubmit = useCallback(async (data: AIFormData) => {
    setIsGenerating(true);
    setApiError('');

    if (!bellaConfig) {
      setApiError('Bella配置未加载或不存在，请先配置。');
      setIsGenerating(false);
      return;
    }

    try {

      // 构建请求参数
      const requestData = {
        tenantId: bellaConfig.tenantId,
        workflowId: bellaConfig.workflowId,
        userId: bellaConfig.userId,
        responseMode: 'blocking',
        inputs: {
          url: data.url,
          token: data.token,
          prompt: data.prompt
        }
      };

      // 调用AI API
      const response = await fetch(bellaConfig.bellaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bellaConfig.apiKey}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // 检查响应中的 data.status 是否为 "failed"
      if (result.data?.status === 'failed') {
        const errorMessage = result.data?.error || '未知错误';
        toast({
          variant: 'destructive',
          title: 'AI生成失败',
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }
      
      // 尝试解析为JSON以验证格式
      try {
        JSON.parse(result);
        onGenerate(result);
        handleClose();
        toast({
          title: '生成成功',
          description: 'Mock数据已成功生成',
        });
      } catch {
        // 如果不是有效JSON，尝试包装一下
        const wrappedResult = {
          success: true,
          data: result,
          generated_at: new Date().toISOString()
        };
        onGenerate(JSON.stringify(wrappedResult, null, 2));
        handleClose();
        toast({
          title: '生成成功',
          description: 'Mock数据已成功生成',
        });
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      const errorMessage = error instanceof Error ? error.message : '生成失败，请检查API接口和参数';
      setApiError(errorMessage);
      toast({
        variant: 'destructive',
        title: '生成失败',
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [requestInfo, onGenerate, handleClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI生成Mock数据
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 space-y-6 overflow-auto min-h-0">
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{apiError}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">URL</Label>
                <Controller
                  name="url"
                  control={control}
                  rules={{ required: 'URL是必填项' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="url"
                      placeholder="请输入 Weapon URL"
                      className="mt-1"
                    />
                  )}
                />
                {errors.url && <p className="text-destructive text-sm mt-1">{errors.url.message}</p>}
              </div>
              <div>
                <Label htmlFor="token">Token</Label>
                <Controller
                  name="token"
                  control={control}
                  rules={{ required: 'Token是必填项' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="token"
                      type="password"
                      placeholder="请输入认证Token"
                      className="mt-1"
                    />
                  )}
                />
                {errors.token && <p className="text-destructive text-sm mt-1">{errors.token.message}</p>}
              </div>
              <div>
                <Label htmlFor="prompt">Prompt</Label>
                <Controller
                  name="prompt"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="prompt"
                      rows={5}
                      placeholder="请输入Prompt，例如：请生成一个符合以下JSON Schema的Mock数据：{ 'type': 'object', 'properties': { 'name': { 'type': 'string' } } }。这个Prompt可以用来约束AI的响应格式。"
                      className="mt-1 flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || !isValid}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成Mock数据
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MockDataDialog(props: MockDataDialogProps) {
  const { isOpen, onClose, request, onSave } = props;
  const [mockData, setMockData] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  useEffect(() => {
    if (request) {
      setMockData(request.mockData || '');
    }
  }, [request]);

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setIsValidJson(true);
      return;
    }
    
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleMockDataChange = useCallback((value: string) => {
    setMockData(value);
    validateJson(value);
  }, []);

  const formatJson = useCallback(() => {
    if (!mockData.trim()) return;
    
    try {
      const parsed = JSON.parse(mockData);
      const formatted = JSON.stringify(parsed, null, 2);
      setMockData(formatted);
      setIsValidJson(true);
    } catch {
      // 如果无法解析，保持原样
    }
  }, [mockData]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mockData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
    }
  }, [mockData]);

  const insertTemplate = useCallback((template: string) => {
    setMockData(template);
    validateJson(template);
  }, []);

  const openAIDialog = useCallback(() => {
    setIsAIDialogOpen(true);
  }, []);

  const closeAIDialog = useCallback(() => {
    setIsAIDialogOpen(false);
  }, []);

  const handleAIGenerate = useCallback((generatedData: string) => {
    setMockData(generatedData);
    validateJson(generatedData);
  }, []);

  const handleSave = () => {
    if (request && isValidJson) {
      onSave(request.url, mockData);
      onClose();
    }
  };

  const handleClose = () => {
    setMockData('');
    setIsValidJson(true);
    setIsCopied(false);
    setIsAIDialogOpen(false);
    onClose();
  };

  // 常用模板
  const templates = {
    success: '{\n  "success": true,\n  "message": "操作成功",\n  "data": {}\n}',
    error: '{\n  "success": false,\n  "message": "操作失败",\n  "error": "错误信息"\n}',
    list: '{\n  "success": true,\n  "data": {\n    "list": [],\n    "total": 0,\n    "page": 1,\n    "pageSize": 10\n  }\n}',
    user: '{\n  "success": true,\n  "data": {\n    "id": 1,\n    "name": "用户名",\n    "email": "user@example.com"\n  }\n}'
  };

  return (
    <>
      <Dialog open={isOpen && !!request} onOpenChange={handleClose}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              编辑Mock响应
            </DialogTitle>
            <DialogDescription>
              {request?.method} {request?.url}
            </DialogDescription>
          </DialogHeader>

          {/* 表单内容 - 可滚动区域 */}
          <div className="flex-1 space-y-4 overflow-auto min-h-0">

            {/* Mock数据 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="mockData" className="text-sm font-medium">响应数据</Label>
                <div className="flex items-center gap-2">
                  {/* 模板选择 */}
                  <div className="flex gap-1">
                    {Object.entries(templates).map(([key, template]) => (
                      <Button
                        key={key}
                        size="sm"
                        variant="outline"
                        onClick={() => insertTemplate(template)}
                        className="h-7 px-2 text-xs"
                      >
                        {key}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 工具栏 */}
              <div className="flex items-center justify-between bg-muted/50 p-2 rounded-t-md border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">JSON编辑器</span>
                  {!isValidJson && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="w-3 h-3" />
                      语法错误
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={openAIDialog}
                    className="h-7 px-2"
                    title="AI生成Mock数据"
                  >
                    <Sparkles className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={formatJson}
                    disabled={!isValidJson || !mockData.trim()}
                    className="h-7 px-2"
                    title="格式化JSON"
                  >
                    <Wand2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyToClipboard}
                    disabled={!mockData.trim()}
                    className="h-7 px-2"
                    title="复制到剪贴板"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* CodeMirror编辑器 */}
              <div className="border rounded-b-md overflow-hidden">
                <CodeMirror
                  value={mockData}
                  onChange={handleMockDataChange}
                  extensions={[json()]}
                  theme={oneDark}
                  height="300px"
                  placeholder='输入Mock响应数据，例如：{"success": true, "data": "Hello World"}'
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    highlightSelectionMatches: false,
                  }}
                />
              </div>
            
              <p className="text-xs text-muted-foreground">
                提示：支持JSON语法高亮和自动格式化。可以使用上方模板快速插入常用格式。
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="min-w-[80px]"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidJson}
              className="flex items-center gap-2 min-w-[100px]"
            >
              <Save className="w-4 h-4" />
              保存Mock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI生成配置弹窗 */}
      <AIGenerateDialog
        isOpen={isAIDialogOpen}
        onClose={closeAIDialog}
        onGenerate={handleAIGenerate}
        requestInfo={request ? {
          method: request.method,
          url: request.url
        } : undefined}
      />
    </>
  );
}