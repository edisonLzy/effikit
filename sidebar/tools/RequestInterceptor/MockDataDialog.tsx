import React, { useState, useEffect, useCallback } from 'react';
import { Save, Code, AlertTriangle, Wand2, Copy, Check, Sparkles, Plus, Trash2, Loader2 } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { CapturedHttpRequest } from './types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';

interface CustomParam {
  key: string;
  value: string;
}

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
  apiEndpoint: string;
  method: string;
  customParams: CustomParam[];
}

function AIGenerateDialog(props: AIGenerateDialogProps) {
  const { isOpen, onClose, onGenerate, requestInfo } = props;
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // 使用 react-hook-form 管理表单状态
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<AIFormData>({
    defaultValues: {
      apiEndpoint: '',
      method: requestInfo?.method || 'POST',
      customParams: []
    },
    mode: 'onChange'
  });

  // 使用 useFieldArray 管理动态参数数组
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customParams'
  });

  // 监听表单字段变化
  const apiEndpoint = watch('apiEndpoint');
  
  useEffect(() => {
    if (apiError && apiEndpoint) {
      setApiError('');
    }
  }, [apiEndpoint, apiError]);

  const handleClose = useCallback(() => {
    reset();
    setApiError('');
    setIsGenerating(false);
    onClose();
  }, [onClose, reset]);

  const addCustomParam = useCallback(() => {
    append({ key: '', value: '' });
  }, [append]);

  const removeCustomParam = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  const onSubmit = useCallback(async (data: AIFormData) => {
    setIsGenerating(true);
    setApiError('');

    try {
      // 构建请求参数
      const requestData: any = {
        method: data.method,
        url: requestInfo?.url,
      };

      // 添加自定义参数
      data.customParams.forEach(param => {
        if (param.key && param.value) {
          requestData[param.key] = param.value;
        }
      });

      // 调用AI API
      const response = await fetch(data.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer d9a710ab-2df9-47ec-9ab8-52301791db75'
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      
      // 尝试解析为JSON以验证格式
      try {
        JSON.parse(result);
        onGenerate(result);
        handleClose();
      } catch {
        // 如果不是有效JSON，尝试包装一下
        const wrappedResult = {
          success: true,
          data: result,
          generated_at: new Date().toISOString()
        };
        onGenerate(JSON.stringify(wrappedResult, null, 2));
        handleClose();
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      setApiError(error instanceof Error ? error.message : '生成失败，请检查API接口和参数');
    } finally {
      setIsGenerating(false);
    }
  }, [requestInfo, onGenerate, handleClose]);

  // 表单验证规则
  const validateUrl = (value: string) => {
    if (!value.trim()) {
      return 'API 接口地址为必填项';
    }
    try {
      new URL(value);
      return true;
    } catch {
      return '请输入有效的URL地址';
    }
  };

  const validateParamKey = (value: string, index: number) => {
    const params = watch('customParams');
    const correspondingValue = params[index]?.value;
    
    if (correspondingValue && !value.trim()) {
      return 'key不能为空';
    }
    return true;
  };

  const validateParamValue = (value: string, index: number) => {
    const params = watch('customParams');
    const correspondingKey = params[index]?.key;
    
    if (correspondingKey && !value.trim()) {
      return 'value不能为空';
    }
    return true;
  };

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
            {/* API接口地址 */}
            <div className="space-y-2">
              <Label htmlFor="aiApiEndpoint" className="text-sm font-medium">
                AI API 接口地址 <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="apiEndpoint"
                control={control}
                rules={{ validate: validateUrl }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="aiApiEndpoint"
                    placeholder="https://api.example.com/generate-mock"
                    className={errors.apiEndpoint ? 'border-destructive' : ''}
                    disabled={isGenerating}
                  />
                )}
              />
              {errors.apiEndpoint && (
                <p className="text-xs text-destructive">{errors.apiEndpoint.message}</p>
              )}
            </div>

            {/* HTTP Method 选择 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                HTTP Method <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="method"
                control={control}
                rules={{ required: 'HTTP Method 为必填项' }}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className={errors.method ? 'border-destructive' : ''}>
                      <SelectValue placeholder="选择 HTTP Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.method && (
                <p className="text-xs text-destructive">{errors.method.message}</p>
              )}
            </div>

            {/* 自定义参数 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">自定义参数</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addCustomParam}
                  disabled={isGenerating}
                  className="h-7 px-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  添加参数
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  暂无自定义参数，点击"添加参数"来添加
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Key</Label>
                            <Controller
                              name={`customParams.${index}.key`}
                              control={control}
                              rules={{ 
                                validate: (value) => validateParamKey(value, index)
                              }}
                              render={({ field: keyField }) => (
                                <Input
                                  {...keyField}
                                  placeholder="参数名"
                                  className={errors.customParams?.[index]?.key ? 'border-destructive' : ''}
                                  disabled={isGenerating}
                                />
                              )}
                            />
                            {errors.customParams?.[index]?.key && (
                              <p className="text-xs text-destructive">
                                {errors.customParams[index]?.key?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Value</Label>
                            <Controller
                              name={`customParams.${index}.value`}
                              control={control}
                              rules={{ 
                                validate: (value) => validateParamValue(value, index)
                              }}
                              render={({ field: valueField }) => (
                                <Input
                                  {...valueField}
                                  placeholder="参数值"
                                  className={errors.customParams?.[index]?.value ? 'border-destructive' : ''}
                                  disabled={isGenerating}
                                />
                              )}
                            />
                            {errors.customParams?.[index]?.value && (
                              <p className="text-xs text-destructive">
                                {errors.customParams[index]?.value?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCustomParam(index)}
                          disabled={isGenerating}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* API错误提示 */}
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{apiError}</p>
              </div>
            )}
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